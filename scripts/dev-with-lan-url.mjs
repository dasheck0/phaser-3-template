import { spawn } from "node:child_process";
import os from "node:os";

const DEFAULT_PORT = 3000;

const getLocalIpv4Address = () => {
	const interfaces = os.networkInterfaces();

	for (const values of Object.values(interfaces)) {
		if (!values) {
			continue;
		}

		for (const entry of values) {
			if (entry.family === "IPv4" && !entry.internal) {
				return entry.address;
			}
		}
	}

	return null;
};

const port = Number(process.env.PORT ?? DEFAULT_PORT);
const ip = getLocalIpv4Address();

console.log("[dev] Local URL:  http://localhost:" + String(port));
if (ip) {
	console.log("[dev] Phone URL:  http://" + ip + ":" + String(port));
} else {
	console.log("[dev] Phone URL:  not detected (check your network connection)");
}

const viteProcess = spawn(
	"vite",
	["--host", "0.0.0.0", "--port", String(port)],
	{
		stdio: "inherit",
		shell: true,
		env: process.env,
	},
);

viteProcess.on("exit", (code, signal) => {
	if (typeof code === "number") {
		process.exit(code);
	}

	if (signal) {
		process.kill(process.pid, signal);
	}

	process.exit(1);
});
