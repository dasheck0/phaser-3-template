import Phaser from 'phaser';
import { BootScene } from '@scenes/boot-scene';
import { MainMenuScene } from '@scenes/main-menu-scene';
import { GameScene } from '@scenes/game-scene';
import { GameOverScene } from '@scenes/game-over-scene';

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
  scene: [BootScene, MainMenuScene, GameScene, GameOverScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
});
