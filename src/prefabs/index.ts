/**
 * Prefab Registry - Central registry for all prefab types
 * Uses PrefabManager singleton for global access
 */

import PrefabManager from '@systems/prefab-manager';
import { Audio } from './audio/audio';
import { Enemy } from './game/enemy';
import { Platform } from './game/platform';
import { Player } from './game/player';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Panel } from './ui/panel';
import { Slider } from './ui/slider';
import { Sprite } from './ui/sprite';

// Register all prefabs with PrefabManager
PrefabManager.register('Player', Player);
PrefabManager.register('Enemy', Enemy);
PrefabManager.register('Button', Button);
PrefabManager.register('Label', Label);
PrefabManager.register('Panel', Panel);
PrefabManager.register('Slider', Slider);
PrefabManager.register('Sprite', Sprite);
PrefabManager.register('Platform', Platform);
PrefabManager.register('Audio', Audio);

// Export prefab classes
export { Audio } from './audio/audio';
export type { AudioTrack, AudioTrackType } from './audio/audio';
export { BaseObject } from './base-object';
export { BaseSprite } from './base-sprite';
export { Enemy } from './game/enemy';
export { Platform } from './game/platform';
export { Player } from './game/player';
export { Button } from './ui/button';
export { Label } from './ui/label';
export { Panel } from './ui/panel';
export { Slider } from './ui/slider';
export { Sprite } from './ui/sprite';

