import { Audio } from '@prefabs/audio/audio';
import { Button } from '@prefabs/ui/button';
import { Label } from '@prefabs/ui/label';
import { gameStore } from '@systems/store/stores/game-store';
import { BaseScene } from '../base-scene';
import { IdleState } from './states/idle-state';
import { TransitionState } from './states/transition-state';

/**
 * MainMenuScene — fully declarative via main-menu.scene.json.
 *
 * Only logic lives here:
 *   - Sync stats label from store
 *   - Wire button callbacks
 *   - Start/stop background music
 */
export class MainMenuScene extends BaseScene {
  private audio: Audio | null = null;

  constructor() {
    super({ key: 'MainMenuScene' });
  }

  protected get scenePath(): string {
    return '/data/scenes/main-menu.scene.json';
  }

  async onCreateReady(): Promise<void> {
    this.initializeBase();
    await this.sceneLoader.loadFromCachedConfig();

    this.fsm.setState('idle');

    const { playCount, masterVolume } = gameStore.getState();
    this.updateStatsLabel(playCount, masterVolume);

    const startButton = this.sceneLoader.getPrefabById('startButton');
    if (startButton instanceof Button) {
      startButton.setOnClick(() => this.startGame());
    }

    const optionsButton = this.sceneLoader.getPrefabById('optionsButton');
    if (optionsButton instanceof Button) {
      optionsButton.setOnClick(() => this.showOptions());
    }

    const audioPrefab = this.sceneLoader.getPrefabById('audio');
    this.audio = audioPrefab instanceof Audio ? audioPrefab : null;
    this.audio?.playMusic('test');
  }

  protected setupStates(): void {
    this.fsm.addState(new IdleState('idle', this.fsm));
    this.fsm.addState(new TransitionState('transition', this.fsm));
  }

  private updateStatsLabel(playCount: number, masterVolume: number): void {
    const statsLabel = this.sceneLoader.getPrefabById('statsLabel');
    if (statsLabel instanceof Label) {
      statsLabel.setText(`Sessions played: ${playCount}  |  Volume: ${masterVolume.toFixed(2)}`);
    }
  }

  private startGame(): void {
    this.audio?.stopMusic();
    gameStore.actions.incrementPlayCount();
    this.fsm.setState('transition');
    this.scene.start('GameScene');
  }

  private showOptions(): void {
    this.scene.start('OptionsScene');
  }
}
