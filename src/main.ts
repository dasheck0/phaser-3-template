import Phaser from 'phaser';
import { createGameConfig } from '@config/game-config';
// Import prefab registry to trigger registration
import '@prefabs/index';

/**
 * Application Entry Point
 * Initializes Phaser game with modular configuration
 */

// Initialize game when DOM is ready
window.addEventListener('load', () => {
  const config = createGameConfig();
  new Phaser.Game(config);
});
