import { SceneConfig, GroupDefinition, AssetDefinitions, AudioAssetDefinition, ImageAssetDefinition, SpritesheetAssetDefinition } from './types';
import { PrefabFactory } from './prefab-factory';
import { BaseObject } from '@prefabs/base-object';

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

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.groups = new Map();
  }

  /**
   * Fetch and cache a scene config JSON from a URL path.
   * Call this in preload() before Phaser starts its load queue.
   */
  async fetchConfig(path: string): Promise<SceneConfig> {
    const response = await fetch(path);
    if (!response.ok) {
      throw new Error(`SceneLoader: failed to fetch config "${path}" (${response.status})`);
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
      throw new Error('SceneLoader: call fetchConfig() in preload() before loadFromCachedConfig()');
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

    this.loadedPrefabs = PrefabFactory.createPrefabs(this.scene, config.prefabs);
    this.assignPrefabsToGroups(config.prefabs);
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

  private assignPrefabsToGroups(prefabDefs: any[]): void {
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

  // ---------------------------------------------------------------------------
  // Private — background
  // ---------------------------------------------------------------------------

  private applyBackground(background: string): void {
    if (background.startsWith('#')) {
      const color = parseInt(background.substring(1), 16);
      this.scene.cameras.main.setBackgroundColor(color);
    } else {
      console.warn(`SceneLoader: background "${background}" not supported, use hex format`);
    }
  }

  // ---------------------------------------------------------------------------
  // Public accessors
  // ---------------------------------------------------------------------------

  getPrefabById(id: string): BaseObject | null {
    return this.scene.data.get(`prefab:${id}`) || null;
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
    this.loadedPrefabs.forEach((prefab) => prefab.destroy());
    this.loadedPrefabs = [];
    this.groups.forEach((group) => group.destroy(true));
    this.groups.clear();
    this.cachedConfig = null;
  }
}
