/**
 * Prefab Registry - Central registry for all prefab types
 * Uses PrefabManager singleton for global access
 */

import PrefabManager from '@systems/prefab-manager';
import { Audio } from './audio/audio';
import { Enemy } from './game/enemy';
import { Platform } from './game/platform';
import { Player } from './game/player';
import { ButtonPanel } from './ui/button-panel';
import { ClickIndicator } from './ui/click-indicator';
import { IconProgressBar } from './ui/icon-progress-bar';
import { ImageButton } from './ui/image-button';
import { ImageToggleButton } from './ui/image-toggle-button';
import { Label } from './ui/label';
import { PagedParallaxBackground } from './ui/paged-parallax-background';
import { Slider } from './ui/slider';
import { StaticImage } from './ui/static-image';
import { TimeScalePanel } from './ui/time-scale-panel';

// Register all prefabs with PrefabManager
PrefabManager.register('Player', Player);
PrefabManager.register('Enemy', Enemy);
PrefabManager.register('Platform', Platform);
PrefabManager.register('Audio', Audio);
PrefabManager.register('ButtonPanel', ButtonPanel);
PrefabManager.register('ClickIndicator', ClickIndicator);
PrefabManager.register('IconProgressBar', IconProgressBar);
PrefabManager.register('ImageButton', ImageButton);
PrefabManager.register('ImageToggleButton', ImageToggleButton);
PrefabManager.register('Label', Label);
PrefabManager.register('PagedParallaxBackground', PagedParallaxBackground);
PrefabManager.register('Slider', Slider);
PrefabManager.register('StaticImage', StaticImage);
PrefabManager.register('TimeScalePanel', TimeScalePanel);

// Export prefab classes
export { Audio } from './audio/audio';
export type { AudioTrack, AudioTrackType } from './audio/audio';
export { BaseObject } from './base-object';
export { BaseSprite } from './base-sprite';
export { Enemy } from './game/enemy';
export { Platform } from './game/platform';
export { Player } from './game/player';
export { ButtonPanel } from './ui/button-panel';
export type { ButtonPanelOptions, ButtonOptionConfig } from './ui/button-panel';
export { ClickIndicator } from './ui/click-indicator';
export type { ClickIndicatorOptions } from './ui/click-indicator';
export { IconProgressBar } from './ui/icon-progress-bar';
export type { IconProgressBarOptions } from './ui/icon-progress-bar';
export { ImageButton } from './ui/image-button';
export type { ImageButtonOptions } from './ui/image-button';
export { ImageToggleButton } from './ui/image-toggle-button';
export type { ImageToggleButtonOptions } from './ui/image-toggle-button';
export { Label } from './ui/label';
export type { LabelOptions } from './ui/label';
export { NinepatchButton } from './ui/ninepatch-button';
export type { NinepatchButtonOptions } from './ui/ninepatch-button';
export { NinepatchIconButton } from './ui/ninepatch-icon-button';
export type { NinepatchIconButtonOptions } from './ui/ninepatch-icon-button';
export { NinepatchTextButton } from './ui/ninepatch-text-button';
export type { NinepatchTextButtonOptions } from './ui/ninepatch-text-button';
export { PagedParallaxBackground } from './ui/paged-parallax-background';
export type { PagedParallaxBackgroundOptions } from './ui/paged-parallax-background';
export { Slider } from './ui/slider';
export type { SliderOptions } from './ui/slider';
export { StaticImage } from './ui/static-image';
export type { StaticImageOptions } from './ui/static-image';
export { TimeScalePanel } from './ui/time-scale-panel';
export type { TimeScalePanelOptions } from './ui/time-scale-panel';
export type { RexUIAnchor, RexUILabel, RexUISpace } from './ui/common.interface';
