// Type definitions for declarative scene configuration

export interface PrefabProperties {
  [key: string]: unknown;
}

export interface PrefabDefinition {
  type: string;
  id?: string;
  x: number;
  y: number;
  properties?: PrefabProperties;
  group?: string;
}

export interface GroupDefinition {
  name: string;
  depth?: number;
}

// ---------------------------------------------------------------------------
// Asset definitions — everything the scene needs to load before create()
// ---------------------------------------------------------------------------

export interface AudioAssetDefinition {
  key: string;
  path: string;
}

export interface ImageAssetDefinition {
  key: string;
  path: string;
}

export interface SpritesheetAssetDefinition {
  key: string;
  path: string;
  frameWidth: number;
  frameHeight: number;
  startFrame?: number;
  endFrame?: number;
}

export interface AssetDefinitions {
  audio?: AudioAssetDefinition[];
  images?: ImageAssetDefinition[];
  spritesheets?: SpritesheetAssetDefinition[];
}

// ---------------------------------------------------------------------------
// Scene config
// ---------------------------------------------------------------------------

export interface SceneConfig {
  background?: string;
  assets?: AssetDefinitions;
  groups?: GroupDefinition[];
  prefabs: PrefabDefinition[];
}

