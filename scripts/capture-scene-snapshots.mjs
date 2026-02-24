import { execFileSync, spawn } from "node:child_process";
import { mkdir, readFile, rm } from "node:fs/promises";
import net from "node:net";
import path from "node:path";
import process from "node:process";
import { setTimeout as wait } from "node:timers/promises";
import { chromium } from "playwright";

const DEFAULT_CONFIG_FILE = "scene-snapshots.config.json";

console.log("[scene-snapshots] PWDEBUG:", process.env.PWDEBUG);
console.log("[scene-snapshots] NODE_ENV:", process.env.NODE_ENV);

const parseCliArgs = () => {
	const args = process.argv.slice(2);
	const configFlagIndex = args.indexOf("--config");
	if (configFlagIndex === -1) {
		return { configPath: path.resolve(process.cwd(), DEFAULT_CONFIG_FILE) };
	}

	const rawPath = args[configFlagIndex + 1];
	if (!rawPath) {
		throw new Error('Missing value for "--config"');
	}

	return { configPath: path.resolve(process.cwd(), rawPath) };
};

const loadConfig = async (configPath) => {
	const fileContent = await readFile(configPath, "utf8");
	const parsed = JSON.parse(fileContent);

	if (!Array.isArray(parsed.viewports) || parsed.viewports.length === 0) {
		throw new Error("Config must include at least one viewport");
	}

	if (!Array.isArray(parsed.scenes) || parsed.scenes.length === 0) {
		throw new Error("Config must include at least one scene");
	}

	return {
		baseUrl: parsed.baseUrl,
		outputDir: parsed.outputDir,
		clean: parsed.clean ?? false,
		kill: parsed.kill ?? false,
		imageType: parsed.imageType ?? "png",
		navigationTimeoutMs: parsed.navigationTimeoutMs ?? 30_000,
		sceneReadyTimeoutMs: parsed.sceneReadyTimeoutMs ?? 30_000,
		waitAfterSceneStartMs: parsed.waitAfterSceneStartMs ?? 500,
		server: parsed.server,
		viewports: parsed.viewports,
		scenes: parsed.scenes,
	};
};

const toSafePathPart = (value) =>
	String(value)
		.trim()
		.replaceAll(/[^a-zA-Z0-9._-]+/g, "-")
		.replaceAll(/-+/g, "-")
		.replaceAll(/^-|-$/g, "");

const buildCaptureUrl = (baseUrl) => {
	const url = new URL(baseUrl);
	url.searchParams.set("__sceneSnapshots", "1");
	return url.toString();
};

const waitForServer = async (url, timeoutMs) => {
	const start = Date.now();
	while (Date.now() - start < timeoutMs) {
		try {
			const response = await fetch(url, { method: "GET" });
			if (response.ok) {
				return;
			}
		} catch (_error) {
			// server not ready yet
		}
		await wait(350);
	}

	throw new Error(
		`Timed out waiting for server at ${url} after ${timeoutMs}ms`,
	);
};

const ensurePortAvailable = async (urlString) => {
	const url = new URL(urlString);
	const hostname = url.hostname || "127.0.0.1";
	const protocolDefaultPort = url.protocol === "https:" ? 443 : 80;
	const port = Number(url.port || protocolDefaultPort);

	await new Promise((resolve, reject) => {
		const server = net.createServer();

		server.once("error", (error) => {
			if (error && typeof error === "object" && "code" in error) {
				const errorWithCode = error;
				if (errorWithCode.code === "EADDRINUSE") {
					reject(
						new Error(
							`Port check failed: ${hostname}:${port} is already in use. Stop the running application on this port and retry.`,
						),
					);
					return;
				}
			}

			reject(error);
		});

		server.once("listening", () => {
			server.close((error) => {
				if (error) {
					reject(error);
					return;
				}
				resolve(undefined);
			});
		});

		server.listen(port, hostname);
	});
};

const getPortFromUrl = (urlString) => {
	const url = new URL(urlString);
	const protocolDefaultPort = url.protocol === "https:" ? 443 : 80;
	return Number(url.port || protocolDefaultPort);
};

const getListeningPids = (port) => {
	try {
		const stdout = execFileSync(
			"lsof",
			["-t", `-iTCP:${String(port)}`, "-sTCP:LISTEN"],
			{
				encoding: "utf8",
			},
		);

		return stdout
			.split("\n")
			.map((line) => line.trim())
			.filter((line) => line.length > 0)
			.map((line) => Number(line))
			.filter((value) => Number.isInteger(value));
	} catch (_error) {
		return [];
	}
};

const waitForPortToBeFree = async (readyUrl, timeoutMs) => {
	const startedAt = Date.now();
	while (Date.now() - startedAt < timeoutMs) {
		try {
			await ensurePortAvailable(readyUrl);
			return;
		} catch (_error) {
			await wait(200);
		}
	}

	throw new Error(
		`Port is still blocked after waiting ${timeoutMs}ms: ${readyUrl}`,
	);
};

const clearPortBlockersIfNeeded = async (readyUrl, shouldKill) => {
	try {
		await ensurePortAvailable(readyUrl);
		return;
	} catch (error) {
		if (!shouldKill) {
			throw error;
		}

		const port = getPortFromUrl(readyUrl);
		const pids = getListeningPids(port);
		if (pids.length === 0) {
			throw error;
		}

		console.log(
			`[scene-snapshots] kill=true, terminating process(es) on port ${String(port)}: ${pids.join(", ")}`,
		);

		for (const pid of pids) {
			try {
				process.kill(pid, "SIGTERM");
			} catch (_killError) {
				// process may already be gone
			}
		}

		await waitForPortToBeFree(readyUrl, 5_000).catch(async () => {
			const remaining = getListeningPids(port);
			for (const pid of remaining) {
				try {
					process.kill(pid, "SIGKILL");
				} catch (_killError) {
					// process may already be gone
				}
			}
			await waitForPortToBeFree(readyUrl, 5_000);
		});
	}
};

const startServerIfNeeded = async (serverConfig) => {
	if (!serverConfig?.command) {
		return { processRef: null };
	}

	const readyUrl = serverConfig.readyUrl;
	if (!readyUrl) {
		throw new Error(
			"Config server.readyUrl is required when server.command is set",
		);
	}

	await clearPortBlockersIfNeeded(readyUrl, serverConfig.kill === true);

	const child = spawn(serverConfig.command, {
		cwd: process.cwd(),
		shell: true,
		stdio: "inherit",
		env: {
			...process.env,
			BROWSER: "none",
			OPEN: "false",
		},
	});

	const startupTimeoutMs = serverConfig.startupTimeoutMs ?? 60_000;
	await Promise.race([
		waitForServer(readyUrl, startupTimeoutMs),
		new Promise((_, reject) => {
			child.once("exit", (code, signal) => {
				reject(
					new Error(
						`Server process exited before becoming ready (code=${String(code)}, signal=${String(signal)})`,
					),
				);
			});
		}),
	]);

	return { processRef: child };
};

const stopServer = async (serverProcess) => {
	if (!serverProcess) {
		return;
	}

	serverProcess.kill("SIGTERM");
	await wait(500);
	if (!serverProcess.killed) {
		serverProcess.kill("SIGKILL");
	}
};

const waitForSceneReady = async (page, sceneKey, timeoutMs) => {
	await page.evaluate(
		async ({ targetSceneKey, maxWaitMs }) => {
			const sleep = (ms) =>
				new Promise((resolve) => {
					setTimeout(resolve, ms);
				});

			const getGame = () =>
				window.__SCENE_SNAPSHOTS_GAME__ || window.Phaser?.GAMES?.[0] || null;

			const startAt = Date.now();
			let sceneStarted = false;

			while (Date.now() - startAt < maxWaitMs) {
				const game = getGame();
				if (game?.scene) {
					if (!sceneStarted) {
						game.scene.start(targetSceneKey);
						sceneStarted = true;
					}

					const scene = game.scene.getScene(targetSceneKey);
					const isSceneActive = scene?.scene?.isActive() === true;
					const isLoaderIdle = scene?.load?.isLoading?.() === false;

					if (isSceneActive && isLoaderIdle) {
						return;
					}
				}

				await sleep(50);
			}

			throw new Error(
				`Scene "${targetSceneKey}" did not become ready within ${maxWaitMs}ms`,
			);
		},
		{ targetSceneKey: sceneKey, maxWaitMs: timeoutMs },
	);
};

const run = async () => {
	const { configPath } = parseCliArgs();
	const config = await loadConfig(configPath);

	if (!config.baseUrl) {
		throw new Error("Config baseUrl is required");
	}

	if (!config.outputDir) {
		throw new Error("Config outputDir is required");
	}

	const outputDir = path.resolve(process.cwd(), config.outputDir);
	if (config.clean) {
		console.log(`[scene-snapshots] clean=true, clearing output: ${outputDir}`);
		await rm(outputDir, { recursive: true, force: true });
	}
	await mkdir(outputDir, { recursive: true });
	const captureUrl = buildCaptureUrl(config.baseUrl);

	let processRef = null;
	let browser = null;

	try {
		console.log("[scene-snapshots] Starting snapshot run");
		console.log(`[scene-snapshots] Config: ${configPath}`);
		console.log(`[scene-snapshots] Output: ${outputDir}`);
		console.log(`[scene-snapshots] Base URL: ${captureUrl}`);

		const serverResult = await startServerIfNeeded({
			...config.server,
			kill: config.kill,
		});
		processRef = serverResult.processRef;
		console.log("[scene-snapshots] Server ready");

		delete process.env.PWDEBUG;

		browser = await chromium.launch({
			headless: true,
			args: ["--headless=new"],
		});
		console.log("[scene-snapshots] headless launch ok");
		console.log("[scene-snapshots] Browser launched (headless)");

		for (const viewport of config.viewports) {
			console.log(
				`[scene-snapshots] Viewport: ${viewport.name} (${viewport.width}x${viewport.height})`,
			);

			const context = await browser.newContext({
				viewport: {
					width: viewport.width,
					height: viewport.height,
				},
				deviceScaleFactor: viewport.deviceScaleFactor ?? 1,
			});

			for (const scene of config.scenes) {
				console.log(`[scene-snapshots] Capturing scene: ${scene.key}`);

				const page = await context.newPage();
				await page.goto(captureUrl, {
					waitUntil: "domcontentloaded",
					timeout: config.navigationTimeoutMs,
				});

				await waitForSceneReady(page, scene.key, config.sceneReadyTimeoutMs);
				await page.waitForTimeout(config.waitAfterSceneStartMs);

				const sceneDir = path.join(outputDir, toSafePathPart(scene.key));
				await mkdir(sceneDir, { recursive: true });

				const viewportName = toSafePathPart(viewport.name);
				const extension = config.imageType === "jpeg" ? "jpeg" : "png";
				const filePath = path.join(sceneDir, `${viewportName}.${extension}`);

				await page.screenshot({
					path: filePath,
					type: extension,
					fullPage: false,
				});

				console.log(
					`Captured ${scene.key} @ ${viewport.width}x${viewport.height} -> ${filePath}`,
				);
				await page.close();
			}

			await context.close();
		}
	} finally {
		if (browser) {
			await browser.close();
		}
		await stopServer(processRef);
	}
};

run().catch((error) => {
	console.error("scene-snapshots failed:", error);
	process.exitCode = 1;
});
