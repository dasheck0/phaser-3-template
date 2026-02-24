import { Enemy } from '@/prefabs/game/enemy';
import { Platform } from '@/prefabs/game/platform';
import { Player } from '@/prefabs/game/player';
import { SceneConfig } from '@systems/types';
import { gameStore } from '@systems/store/stores/game-store';
import { BaseScene } from '../base-scene';
import { PlayingState } from './states/playing-state';
import { PausedState } from './states/paused-state';
import { GameOverState } from './states/game-over-state';

/**
 * GameScene - Main gameplay scene with declarative loading
 */
export class GameScene extends BaseScene {
  private player?: Player;
  private enemies: Enemy[] = [];
  private platforms: Platform[] = [];
  private score = 0;
  private scoreText?: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'GameScene' });
  }

  protected get scenePath(): null {
    return null;
  }

  onCreateReady(): void {
    this.initializeBase();
    this.score = 0;

    const cachedConfig = this.cache.json.get('level1Scene');

    if (cachedConfig) {
      this.loadFromCache(cachedConfig);
    } else {
      this.loadFallbackConfig();
    }

    this.setupUI();
    this.fsm.setState('playing');
  }

  protected setupStates(): void {
    this.fsm.addState(new PlayingState('playing', this.fsm));
    this.fsm.addState(new PausedState('paused', this.fsm));
    this.fsm.addState(new GameOverState('gameOver', this.fsm));
  }

  private async loadFromCache(config: SceneConfig): Promise<void> {
    try {
      await this.sceneLoader.loadFromConfig(config);
      this.setupGameObjects();
    } catch (error) {
      console.error('Error loading game scene:', error);
      this.loadFallbackConfig();
    }
  }

  private async loadFallbackConfig(): Promise<void> {
    const config: SceneConfig = {
      background: '#87CEEB',
      prefabs: [
        {
          type: 'Platform',
          id: 'ground',
          layout: { space: 'full', x: 400, y: 568 },
          properties: { width: 800, height: 64 },
        },
        { type: 'Platform', layout: { space: 'full', x: 600, y: 400 }, properties: { width: 200, height: 32 } },
        { type: 'Platform', layout: { space: 'full', x: 150, y: 300 }, properties: { width: 200, height: 32 } },
        {
          type: 'Player',
          id: 'player',
          layout: { space: 'full', x: 100, y: 450 },
          properties: { speed: 160, jumpVelocity: -330 },
        },
        {
          type: 'Enemy',
          id: 'enemy1',
          layout: { space: 'full', x: 400, y: 350 },
          properties: { speed: 50, patrolDistance: 100 },
        },
      ],
    };

    await this.sceneLoader.loadFromConfig(config);
    this.setupGameObjects();
  }

  private setupGameObjects(): void {
    const playerPrefab = this.sceneLoader.getPrefabById('player');
    if (playerPrefab instanceof Player) {
      this.player = playerPrefab;
    }
    this.platforms = [];
    this.enemies = [];
  }

  private setupUI(): void {
    const { playCount, masterVolume } = gameStore.getState();

    this.scoreText = this.add.text(16, 16, `Score: ${this.score}`, {
      fontSize: '24px',
      color: '#000',
    });

    this.add.text(16, 48, `Session #${playCount}  |  Volume: ${masterVolume.toFixed(2)}`, {
      fontSize: '16px',
      color: '#333333',
    });

    this.input.keyboard?.on('keydown-ESC', () => {
      this.scene.start('MainMenuScene');
    });

    this.input.keyboard?.on('keydown-P', () => {
      if (this.fsm.isInState('playing')) {
        this.fsm.setState('paused');
      } else if (this.fsm.isInState('paused')) {
        this.fsm.setState('playing');
      }
    });

    this.input.keyboard?.on('keydown-PLUS', () => {
      gameStore.actions.setMasterVolume(gameStore.getState().masterVolume + 0.1);
    });

    this.input.keyboard?.on('keydown-MINUS', () => {
      gameStore.actions.setMasterVolume(gameStore.getState().masterVolume - 0.1);
    });
  }

  update(time: number, delta: number): void {
    super.update(time, delta);

    if (this.player && this.enemies.length && this.platforms.length && this.scoreText) {
      this.scoreText.setText(`Score: ${this.score}`);
    }
  }
}
