/**
 * Prefab Registry - Central registry for all prefab types
 * Uses PrefabManager singleton for global access
 */

import PrefabManager from '@systems/prefab-manager';
import { Player } from './player';
import { Enemy } from './enemy';
import { Button } from './button';
import { Platform } from './platform';
import { Audio } from './audio/audio';

// Register all prefabs with PrefabManager
PrefabManager.register('Player', Player);
PrefabManager.register('Enemy', Enemy);
PrefabManager.register('Button', Button);
PrefabManager.register('Platform', Platform);
PrefabManager.register('Audio', Audio);

// Export prefab classes
export { Player } from './player';
export { Enemy } from './enemy';
export { Button } from './button';
export { Platform } from './platform';
export { BaseObject } from './base-object';
export { Audio } from './audio/audio';
export type { AudioTrackType, AudioTrack } from './audio/audio';

