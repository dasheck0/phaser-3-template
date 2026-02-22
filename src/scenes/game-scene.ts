import { BaseScene } from './base-scene';
import { State } from '@systems/finite-state-machine';
import { SceneConfig } from '@systems/types';
import { Player } from '@prefabs/player';
import { Enemy } from '@prefabs/enemy';
import { Platform } from '@prefabs/platform';

/**
 * Game Scene States
 */
class PlayingState extends State {
  enter(): void {
    console.log('Game: Playing');
  }

  execute(): void {
    // Game logic here
  }
}

class PausedState extends State {
  enter(): void {
    console.log('Game: Paused');
    const scene = this.fsm.getContext() as GameScene;
    scene.physics.pause();
  }

  exit(): void {
    const scene = this.fsm.getContext() as GameScene;
    scene.physics.resume();
  }
}

class GameOverState extends State {
  enter(): void {
    console.log('Game: Over');
    const scene = this.fsm.getContext() as GameScene;
    scene.scene.start('GameOverScene');
  }
}

/**
 * Game Scene - Main gameplay scene with declarative loading
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

    // Try to load from cached JSON, fallback to inline config
    const cachedConfig = this.cache.json.get('level1Scene');
    
    if (cachedConfig) {
      this.loadFromCache(cachedConfig);
    } else {
      this.loadFallbackConfig();
    }

    // Setup UI
    this.setupUI();

    // Start in playing state
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
    // Fallback inline level configuration
    const config: SceneConfig = {
      background: '#87CEEB',
      prefabs: [
        // Platforms
        {
          type: 'Platform',
          id: 'ground',
          x: 400,
          y: 568,
          properties: { width: 800, height: 64 },
        },
        {
          type: 'Platform',
          x: 600,
          y: 400,
          properties: { width: 200, height: 32 },
        },
        {
          type: 'Platform',
          x: 150,
          y: 300,
          properties: { width: 200, height: 32 },
        },
        // Player
        {
          type: 'Player',
          id: 'player',
          x: 100,
          y: 450,
          properties: {
            speed: 160,
            jumpVelocity: -330,
          },
        },
        // Enemies
        {
          type: 'Enemy',
          id: 'enemy1',
          x: 400,
          y: 350,
          properties: {
            speed: 50,
            patrolDistance: 100,
          },
        },
      ],
    };

    await this.sceneLoader.loadFromConfig(config);
    this.setupGameObjects();
  }

  private setupGameObjects(): void {
    // Get references to game objects (use type assertion carefully)
    const playerPrefab = this.sceneLoader.getPrefabById('player');
    if (playerPrefab instanceof Player) {
      this.player = playerPrefab;
    }
    
    // Collect all platforms and enemies for collision
    this.platforms = [];
    this.enemies = [];

    // Setup collisions (simplified - in real game use proper collision groups)
    // Note: This requires extending the prefabs to expose their physics bodies
  }

  private setupUI(): void {
    this.scoreText = this.add.text(16, 16, `Score: ${this.score}`, {
      fontSize: '24px',
      color: '#000',
    });

    // ESC to return to menu
    this.input.keyboard?.on('keydown-ESC', () => {
      this.scene.start('MainMenuScene');
    });

    // P to pause/unpause
    this.input.keyboard?.on('keydown-P', () => {
      if (this.fsm.isInState('playing')) {
        this.fsm.setState('paused');
      } else if (this.fsm.isInState('paused')) {
        this.fsm.setState('playing');
      }
    });
  }

  update(time: number, delta: number): void {
    super.update(time, delta);

    // Game loop logic here
    // Check win/lose conditions, update score, etc.
    // Example usage of stored references (prevents unused warnings):
    if (this.player && this.enemies.length && this.platforms.length && this.scoreText) {
      // Update score display
      this.scoreText.setText(`Score: ${this.score}`);
      // Future game logic here
    }
  }
}
