import { Button } from '@prefabs/ui/button';
import { Label } from '@prefabs/ui/label';
import { Slider } from '@prefabs/ui/slider';
import { gameStore } from '@systems/store/stores/game-store';
import { BaseScene } from '../base-scene';
import { IdleState } from './states/idle-state';

/**
 * OptionsScene — fully declarative via options.scene.json.
 *
 * Only logic lives here:
 *   - Wire slider onChange → gameStore
 *   - Subscribe to store changes to keep labels in sync
 *   - Wire back button + ESC keyboard shortcut
 */
export class OptionsScene extends BaseScene {
  private unsubscribe!: () => void;

  constructor() {
    super({ key: 'OptionsScene' });
  }

  protected get scenePath(): string {
    return '/data/scenes/options.scene.json';
  }

  async onCreateReady(): Promise<void> {
    this.initializeBase();
    await this.sceneLoader.loadFromCachedConfig();

    this.fsm.setState('idle');

    const { masterVolume, playCount } = gameStore.getState();

    this.updateStatsLabel(playCount);

    const slider = this.sceneLoader.getPrefabById('masterVolumeSlider');
    if (slider instanceof Slider) {
      slider.setValue(masterVolume);
      slider.setOnChange((value) => gameStore.actions.setMasterVolume(value));
    }

    const backButton = this.sceneLoader.getPrefabById('backButton');
    if (backButton instanceof Button) {
      backButton.setOnClick(() => this.goBack());
    }

    this.unsubscribe = gameStore.subscribe((state) => {
      if (slider instanceof Slider) slider.setValue(state.masterVolume);
      this.updateStatsLabel(state.playCount);
    });

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.unsubscribe?.());

    this.input.keyboard?.removeAllListeners('keydown-ESC');
    this.input.keyboard?.once('keydown-ESC', () => this.goBack());
  }

  protected setupStates(): void {
    this.fsm.addState(new IdleState('idle', this.fsm));
  }

  private updateStatsLabel(playCount: number): void {
    const statsLabel = this.sceneLoader.getPrefabById('statsLabel');
    if (statsLabel instanceof Label) {
      statsLabel.setText(`Total sessions played: ${playCount}`);
    }
  }

  private goBack(): void {
    this.unsubscribe?.();
    this.scene.start('MainMenuScene');
  }
}
