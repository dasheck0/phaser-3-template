import Phaser from 'phaser';
import { BootScene } from '@scenes/boot/boot-scene';
import { MainMenuScene } from '@scenes/main-menu/main-menu-scene';
import { GameScene } from '@scenes/game/game-scene';
import { GameOverScene } from '@scenes/game-over/game-over-scene';
import { OptionsScene } from '@scenes/options/options-scene';

// Game configuration following modular principles
export const createGameConfig = (): Phaser.Types.Core.GameConfig => ({
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: 'game-container',
  backgroundColor: '#2d2d2d',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 300 },
      debug: false,
    },
  },
  scene: [BootScene, MainMenuScene, GameScene, GameOverScene, OptionsScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
});
