// Type definitions for declarative scene configuration

export interface PrefabProperties {
	[key: string]: unknown;
}

export interface SceneSafeMargin {
	top?: number;
	right?: number;
	bottom?: number;
	left?: number;
}

export interface SceneLayoutConfig {
	safeMargin?: SceneSafeMargin;
}

export interface LayoutAnchor {
	left?: string | number;
	right?: string | number;
	centerX?: string | number;
	x?: string | number;
	top?: string | number;
	bottom?: string | number;
	centerY?: string | number;
	y?: string | number;
}

export interface LayoutOffset {
	x?: number;
	y?: number;
}

export interface PrefabLayout {
	space?: "safe" | "full";
	x?: number;
	y?: number;
	anchor?: LayoutAnchor;
	offset?: LayoutOffset;
}

export interface PrefabDefinition {
	type: string;
	id?: string;
	layout: PrefabLayout;
	properties?: PrefabProperties;
	group?: string;
}

export interface ResolvedPrefabDefinition {
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
	layout?: SceneLayoutConfig;
	assets?: AssetDefinitions;
	groups?: GroupDefinition[];
	prefabs: PrefabDefinition[];
}
