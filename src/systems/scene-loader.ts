import type { BaseObject } from "@prefabs/base-object";
import { resolvePrefabDefinitions } from "./layout-resolver";
import { PrefabFactory } from "./prefab-factory";
import type {
	AssetDefinitions,
	AudioAssetDefinition,
	GroupDefinition,
	ImageAssetDefinition,
	PrefabDefinition,
	SceneConfig,
	SpritesheetAssetDefinition,
} from "./types";

interface LayoutRect {
	left: number;
	top: number;
	right: number;
	bottom: number;
}

/**
 * Scene Loader - Loads and applies declarative scene configurations
 * Modular: Separates scene data from scene logic
 * Supports: Groups with depth ordering, asset pre-loading from config
 */
export class SceneLoader {
	private scene: Phaser.Scene;
	private loadedPrefabs: BaseObject[] = [];
	private groups: Map<string, Phaser.GameObjects.Group>;
	private cachedConfig: SceneConfig | null = null;
	private activeConfig: SceneConfig | null = null;
	private readonly onResizeBound: () => void;

	constructor(scene: Phaser.Scene) {
		this.scene = scene;
		this.groups = new Map();
		this.onResizeBound = () => this.relayoutPrefabs();
	}

	/**
	 * Fetch and cache a scene config JSON from a URL path.
	 * Call this in preload() before Phaser starts its load queue.
	 */
	async fetchConfig(path: string): Promise<SceneConfig> {
		const response = await fetch(path);
		if (!response.ok) {
			throw new Error(
				`SceneLoader: failed to fetch config "${path}" (${response.status})`,
			);
		}
		const config: SceneConfig = await response.json();
		this.cachedConfig = config;
		return config;
	}

	/**
	 * Explicitly set the cached config (used by BaseScene two-pass preload).
	 */
	setCachedConfig(config: SceneConfig): void {
		this.cachedConfig = config;
	}

	/**
	 * Register all assets from a config with Phaser's loader.
	 * Returns true if any assets were registered (signals a pass 2 is needed).
	 * Pure intent: reads config, issues loader calls, no other side effects.
	 */
	preloadAssets(config: SceneConfig): boolean {
		if (!config.assets) return false;
		this.registerAudioAssets(config.assets);
		this.registerImageAssets(config.assets);
		this.registerSpritesheetAssets(config.assets);
		return (
			(config.assets.audio?.length ?? 0) > 0 ||
			(config.assets.images?.length ?? 0) > 0 ||
			(config.assets.spritesheets?.length ?? 0) > 0
		);
	}

	/**
	 * Instantiate prefabs from the cached config.
	 * Call this in create() after Phaser has finished loading assets.
	 * Throws if fetchConfig() was not called first.
	 */
	async loadFromCachedConfig(): Promise<void> {
		if (!this.cachedConfig) {
			throw new Error(
				"SceneLoader: call fetchConfig() in preload() before loadFromCachedConfig()",
			);
		}
		await this.loadFromConfig(this.cachedConfig);
	}

	/**
	 * Load a scene from a configuration object directly.
	 * Use when config is inlined in scene code (e.g. buttons with callbacks).
	 */
	async loadFromConfig(config: SceneConfig): Promise<void> {
		if (config.background) {
			this.applyBackground(config.background);
		}

		if (config.groups) {
			this.createGroups(config.groups);
		}

		const gameSize = this.scene.scale.gameSize;
		const visibleWorldRect = this.getVisibleWorldRect(
			gameSize.width,
			gameSize.height,
		);
		const resolvedPrefabs = resolvePrefabDefinitions(config.prefabs, {
			sceneLayout: config.layout,
			worldWidth: gameSize.width,
			worldHeight: gameSize.height,
			visibleWorldRect,
		});

		this.loadedPrefabs = PrefabFactory.createPrefabs(
			this.scene,
			resolvedPrefabs,
		);
		this.assignPrefabsToGroups(config.prefabs);
		this.activeConfig = config;
		this.scene.scale.off(Phaser.Scale.Events.RESIZE, this.onResizeBound, this);
		this.scene.scale.on(Phaser.Scale.Events.RESIZE, this.onResizeBound, this);
	}

	/**
	 * Load a scene from a JSON file path.
	 * NOTE: assets in config.assets will NOT be loaded via this path —
	 * use fetchConfig() + preloadAssets() in preload() for that.
	 */
	async loadFromFile(path: string): Promise<void> {
		const config = await this.fetchConfig(path);
		await this.loadFromConfig(config);
	}

	// ---------------------------------------------------------------------------
	// Private — asset registration helpers (one per asset type)
	// ---------------------------------------------------------------------------

	private registerAudioAssets(assets: AssetDefinitions): void {
		if (!assets.audio) return;
		assets.audio.forEach((def: AudioAssetDefinition) => {
			this.scene.load.audio(def.key, def.path);
		});
	}

	private registerImageAssets(assets: AssetDefinitions): void {
		if (!assets.images) return;
		assets.images.forEach((def: ImageAssetDefinition) => {
			this.scene.load.image(def.key, def.path);
		});
	}

	private registerSpritesheetAssets(assets: AssetDefinitions): void {
		if (!assets.spritesheets) return;
		assets.spritesheets.forEach((def: SpritesheetAssetDefinition) => {
			this.scene.load.spritesheet(def.key, def.path, {
				frameWidth: def.frameWidth,
				frameHeight: def.frameHeight,
				startFrame: def.startFrame,
				endFrame: def.endFrame,
			});
		});
	}

	// ---------------------------------------------------------------------------
	// Private — group helpers
	// ---------------------------------------------------------------------------

	private createGroups(groupDefs: GroupDefinition[]): void {
		groupDefs.forEach((def) => {
			const group = this.scene.add.group();
			this.groups.set(def.name, group);
			if (def.depth !== undefined) {
				group.setDepth(def.depth);
			}
		});
	}

	private assignPrefabsToGroups(prefabDefs: PrefabDefinition[]): void {
		prefabDefs.forEach((def, index) => {
			if (def.group && this.groups.has(def.group)) {
				const prefab = this.loadedPrefabs[index];
				const group = this.groups.get(def.group)!;
				prefab.getGameObjects().forEach((obj) => {
					if (obj instanceof Phaser.GameObjects.GameObject) {
						group.add(obj);
					}
				});
			}
		});
	}

	private getVisibleWorldRect(
		worldWidth: number,
		worldHeight: number,
	): LayoutRect {
		const canvasRect = this.scene.game.canvas.getBoundingClientRect();
		const parentRect =
			this.scene.game.canvas.parentElement?.getBoundingClientRect() ??
			new DOMRect(0, 0, window.innerWidth, window.innerHeight);

		if (canvasRect.width <= 0 || canvasRect.height <= 0) {
			return { left: 0, top: 0, right: worldWidth, bottom: worldHeight };
		}

		const visibleLeftCss =
			Math.max(parentRect.left, canvasRect.left) - canvasRect.left;
		const visibleTopCss =
			Math.max(parentRect.top, canvasRect.top) - canvasRect.top;
		const visibleRightCss =
			Math.min(parentRect.right, canvasRect.right) - canvasRect.left;
		const visibleBottomCss =
			Math.min(parentRect.bottom, canvasRect.bottom) - canvasRect.top;

		const cssToWorldX = worldWidth / canvasRect.width;
		const cssToWorldY = worldHeight / canvasRect.height;

		return {
			left: visibleLeftCss * cssToWorldX,
			top: visibleTopCss * cssToWorldY,
			right: visibleRightCss * cssToWorldX,
			bottom: visibleBottomCss * cssToWorldY,
		};
	}

	private relayoutPrefabs(): void {
		if (!this.activeConfig || this.loadedPrefabs.length === 0) {
			return;
		}

		const gameSize = this.scene.scale.gameSize;
		const visibleWorldRect = this.getVisibleWorldRect(
			gameSize.width,
			gameSize.height,
		);
		const resolvedPrefabs = resolvePrefabDefinitions(
			this.activeConfig.prefabs,
			{
				sceneLayout: this.activeConfig.layout,
				worldWidth: gameSize.width,
				worldHeight: gameSize.height,
				visibleWorldRect,
			},
		);

		resolvedPrefabs.forEach((resolved, index) => {
			const prefab = this.loadedPrefabs[index];
			if (!prefab) {
				return;
			}

			prefab.getGameObjects().forEach((obj) => {
				if ("setPosition" in obj && typeof obj.setPosition === "function") {
					(
						obj as { setPosition: (x: number, y: number) => unknown }
					).setPosition(resolved.x, resolved.y);
				}
			});
		});
	}

	// ---------------------------------------------------------------------------
	// Private — background
	// ---------------------------------------------------------------------------

	private applyBackground(background: string): void {
		if (background.startsWith("#")) {
			const color = parseInt(background.substring(1), 16);
			this.scene.cameras.main.setBackgroundColor(color);
		} else {
			throw new Error(
				`SceneLoader: background "${background}" not supported, use hex format`,
			);
		}
	}

	// ---------------------------------------------------------------------------
	// Public accessors
	// ---------------------------------------------------------------------------

	getPrefabById(id: string): BaseObject {
		const result = this.scene.data.get(`prefab:${id}`) as
			| BaseObject
			| undefined;
		if (!result) {
			throw new Error(`[SceneLoader] getPrefabById("${id}"): prefab not found`);
		}
		return result;
	}

	getPrefabs(): BaseObject[] {
		return [...this.loadedPrefabs];
	}

	getGroup(name: string): Phaser.GameObjects.Group | undefined {
		return this.groups.get(name);
	}

	getCachedConfig(): SceneConfig | null {
		return this.cachedConfig;
	}

	destroy(): void {
		this.scene.scale.off(Phaser.Scale.Events.RESIZE, this.onResizeBound, this);
		this.loadedPrefabs.forEach((prefab) => {
			prefab.destroy();
		});
		this.loadedPrefabs = [];
		this.groups.forEach((group) => {
			group.destroy(true);
		});
		this.groups.clear();
		this.cachedConfig = null;
		this.activeConfig = null;
	}
}
