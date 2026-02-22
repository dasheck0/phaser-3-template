import { BaseScene } from './base-scene';
import { State } from '@systems/finite-state-machine';
import { Audio } from '@prefabs/audio/audio';
import { Button } from '@prefabs/button';

/**
 * Main Menu States
 */
class IdleState extends State {
  enter(): void {
    console.log('MainMenu: Idle');
  }
}

class TransitionState extends State {
  enter(): void {
    console.log('MainMenu: Transitioning');
  }
}

/**
 * Main Menu Scene - fully declarative via main-menu.scene.json
 * Assets and prefabs come from JSON; callbacks are wired after create().
 */
export class MainMenuScene extends BaseScene {
  private audio!: Audio;

  constructor() {
    super({ key: 'MainMenuScene' });
  }

  protected get scenePath(): string {
    return '/data/scenes/main-menu.scene.json';
  }

  async onCreateReady(): Promise<void> {
    this.initializeBase();

    // Instantiate all prefabs from the JSON config loaded in preload()
    await this.sceneLoader.loadFromCachedConfig();

    // Title text (no JSON equivalent for freeform text yet)
    this.add.text(400, 150, 'Phaser 3 Starter', {
      fontSize: '48px',
      color: '#ffffff',
    }).setOrigin(0.5);

    // Wire button callbacks — JSON cannot carry functions
    const startButton = this.sceneLoader.getPrefabById('startButton') as Button;
    const optionsButton = this.sceneLoader.getPrefabById('optionsButton') as Button;
    startButton.setOnClick(() => this.startGame());
    optionsButton.setOnClick(() => this.showOptions());

    // Start background music declared in JSON assets
    this.audio = this.sceneLoader.getPrefabById('audio') as Audio;
    this.audio.playMusic('test');

    this.fsm.setState('idle');
  }

  protected setupStates(): void {
    this.fsm.addState(new IdleState('idle', this.fsm));
    this.fsm.addState(new TransitionState('transition', this.fsm));
  }

  private startGame(): void {
    this.audio.stopMusic();
    this.fsm.setState('transition');
    this.scene.start('GameScene');
  }

  private showOptions(): void {
    console.log('Options button clicked - implement options menu here');
  }
}
