import { BaseScene } from '../base-scene';
import { FiniteStateMachine } from '@systems/finite-state-machine';
import { LoadingState } from './states/loading-state';
import { CompleteState } from './states/complete-state';

/**
 * Boot Scene - Initial loading scene with FSM
 * Loads scene JSON configs and transitions to main menu.
 * No scene-specific assets here — each scene owns its own assets via JSON.
 */
export class BootScene extends BaseScene {
  constructor() {
    super({ key: 'BootScene' });
  }

  protected get scenePath(): null {
    return null;
  }

  preload(): void {
    super.preload();

    this.fsm = new FiniteStateMachine(this);
    this.setupStates();
    this.fsm.setState('loading');

    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(width / 2 - 160, height / 2 - 25, 320, 50);

    const loadingText = this.add.text(width / 2, height / 2 - 50, 'Loading...', {
      fontSize: '20px',
      color: '#ffffff',
    });
    loadingText.setOrigin(0.5, 0.5);

    const percentText = this.add.text(width / 2, height / 2, '0%', {
      fontSize: '18px',
      color: '#ffffff',
    });
    percentText.setOrigin(0.5, 0.5);

    this.load.on('progress', (value: number) => {
      percentText.setText(`${Math.floor(value * 100)}%`);
      progressBar.clear();
      progressBar.fillStyle(0x4a90e2, 1);
      progressBar.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30);
    });

    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
      percentText.destroy();
      this.fsm.setState('complete');
    });

    this.load.json('mainMenuScene', '/data/scenes/main-menu.scene.json');
    this.load.json('level1Scene', '/data/scenes/level-1.scene.json');
  }

  protected setupStates(): void {
    this.fsm.addState(new LoadingState('loading', this.fsm));
    this.fsm.addState(new CompleteState('complete', this.fsm));
  }

  onCreateReady(): void {
    this.time.delayedCall(500, () => {
      this.scene.start('MainMenuScene');
    });
  }
}
