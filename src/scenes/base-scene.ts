import type { BaseObject } from "@prefabs/base-object";
import { FiniteStateMachine } from "@systems/finite-state-machine";
import { SceneLoader } from "@systems/scene-loader";
import Phaser from "phaser";

/**
 * BaseScene - Base class for all game scenes
 *
 * Two-pass preload pattern:
 *   Pass 1 — load.json() fetches the scene config JSON via Phaser's queue
 *   On pass 1 complete — register asset files from config.assets, start pass 2
 *   Pass 2 — load.start() loads the actual asset files
 *   create() — deferred until pass 2 is also done via assetsReady flag
 */
export abstract class BaseScene extends Phaser.Scene {
	protected fsm!: FiniteStateMachine;
	protected sceneLoader!: SceneLoader;
	protected groups: Map<string, Phaser.GameObjects.Group>;

	// True once both preload passes are fully complete
	private assetsReady = false;
	// Queued create() call, held until assetsReady
	private pendingCreate: (() => void) | null = null;
	// Guard against onCreateReady() being called twice in one scene lifecycle
	private creating = false;

	constructor(config: string | Phaser.Types.Scenes.SettingsConfig) {
		super(config);
		this.groups = new Map();
	}

	/**
	 * Phaser init() is the first lifecycle hook where this.events is available.
	 * We register the SHUTDOWN listener here so it fires on every scene stop/restart.
	 * Using off+on prevents duplicate registrations across multiple scene restarts.
	 */
	init(): void {
		this.events.off(Phaser.Scenes.Events.SHUTDOWN, this.onSceneShutdown, this);
		this.events.on(Phaser.Scenes.Events.SHUTDOWN, this.onSceneShutdown, this);
	}

	/**
	 * URL path to the scene's JSON config file.
	 * Return null to skip JSON-driven asset loading (e.g. BootScene).
	 */
	protected abstract get scenePath(): string | null;

	/**
	 * Phaser preload lifecycle — two-pass asset loading.
	 * Subclasses that override preload() MUST call super.preload() first.
	 */
	preload(): void {
		// Reset state for each (re)start of the scene
		this.assetsReady = false;
		this.pendingCreate = null;
		this.creating = false;

		this.sceneLoader = new SceneLoader(this);
		const path = this.scenePath;

		if (!path) {
			this.assetsReady = true;
			return;
		}

		// Use the scene path as cache key so different scenes never collide
		const cacheKey = `__sceneConfig:${path}`;

		// Pass 1: load the JSON config via Phaser's native loader
		this.load.json(cacheKey, path);

		this.load.once("complete", () => {
			const config = this.cache.json.get(cacheKey);

			if (!config) {
				this.assetsReady = true;
				this.flushPendingCreate();
				return;
			}

			this.sceneLoader.setCachedConfig(config);
			const hadAssets = this.sceneLoader.preloadAssets(config);

			if (hadAssets) {
				// Pass 2: wait for asset files to finish loading
				this.load.once("complete", () => {
					this.assetsReady = true;
					this.flushPendingCreate();
				});
				this.load.start();
			} else {
				// No assets to load — ready immediately
				this.assetsReady = true;
				this.flushPendingCreate();
			}
		});
	}

	/**
	 * Phaser calls create() after preload() finishes its queue.
	 * However pass 2 (load.start()) runs asynchronously after the first
	 * complete event, so Phaser may fire create() before pass 2 is done.
	 * We intercept here and defer the real create until assetsReady.
	 *
	 * Subclasses implement onCreateReady() instead of create().
	 */
	create(): void {
		if (this.creating) {
			console.warn(
				`[BaseScene] create() called twice — ignoring (${this.scene.key})`,
			);
			return;
		}
		this.creating = true;
		if (this.assetsReady) {
			this.onCreateReady();
		} else {
			this.pendingCreate = () => this.onCreateReady();
		}
	}

	/**
	 * Override this instead of create() in subclasses.
	 * Guaranteed to run only after all assets are loaded.
	 */
	protected abstract onCreateReady(): void | Promise<void>;

	private flushPendingCreate(): void {
		if (this.pendingCreate) {
			const fn = this.pendingCreate;
			this.pendingCreate = null;
			fn();
		}
	}

	/**
	 * Initialize FSM and SceneLoader.
	 * Call this at the start of onCreateReady() in each subclass.
	 */
	protected initializeBase(): void {
		if (!this.sceneLoader) {
			this.sceneLoader = new SceneLoader(this);
		}
		this.fsm = new FiniteStateMachine(this);
		this.setupStates();
	}

	/** Setup FSM states — implement in subclass */
	protected abstract setupStates(): void;

	/** Base update loop — updates FSM and all loaded prefabs */
	update(time: number, delta: number): void {
		if (this.fsm) {
			this.fsm.update(time, delta);
		}
		if (this.sceneLoader) {
			this.sceneLoader.getPrefabs().forEach((prefab) => {
				prefab.update(time, delta);
			});
		}
	}

	protected getOrCreateGroup(name: string): Phaser.GameObjects.Group {
		if (!this.groups.has(name)) {
			this.groups.set(name, this.add.group());
		}
		return this.groups.get(name)!;
	}

	protected addPrefabToGroup(prefab: BaseObject, groupName: string): void {
		const group = this.getOrCreateGroup(groupName);
		prefab.getGameObjects().forEach((obj) => {
			if (obj instanceof Phaser.GameObjects.GameObject) {
				group.add(obj);
			}
		});
	}

	private onSceneShutdown(): void {
		if (this.sceneLoader) {
			this.sceneLoader.destroy();
		}
		this.groups.clear();
		const allData = this.data.getAll() as Record<string, unknown>;
		const prefabKeys = Object.keys(allData).filter((key) =>
			key.startsWith("prefab:"),
		);
		prefabKeys.forEach((key) => {
			this.data.remove(key);
		});
	}
}
