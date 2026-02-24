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
    this.wireSlider(masterVolume);
    this.wireButton('backButton', () => this.goBack());

    this.unsubscribe = gameStore.subscribe((state) => {
      this.updateStatsLabel(state.playCount);
    });

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.unsubscribe?.());
    this.input.keyboard?.removeAllListeners('keydown-ESC');
    this.input.keyboard?.once('keydown-ESC', () => this.goBack());
  }

  protected setupStates(): void {
    this.fsm.addState(new IdleState('idle', this.fsm));
  }

  private wireSlider(initialValue: number): void {
    const prefab = this.sceneLoader.getPrefabById('masterVolumeSlider');
    if (!(prefab instanceof Slider)) {
      throw new Error('[OptionsScene] wireSlider: "masterVolumeSlider" is not a Slider');
    }
    prefab.setValue(initialValue);
    (prefab.getWidget() as Phaser.GameObjects.GameObject & { on: (event: string, fn: (value: number) => void) => void })
      .on('valuechange', (value: number) => gameStore.actions.setMasterVolume(value));
  }

  private wireButton(id: string, callback: () => void): void {
    const prefab = this.sceneLoader.getPrefabById(id);
    if (!(prefab instanceof Label)) {
      throw new Error(`[OptionsScene] wireButton "${id}": prefab is not a Label`);
    }
    (prefab.getWidget() as Phaser.GameObjects.GameObject & { on: (event: string, fn: () => void) => void })
      .on('click', callback);
  }

  private updateStatsLabel(playCount: number): void {
    const prefab = this.sceneLoader.getPrefabById('statsLabel');
    if (!(prefab instanceof Label)) {
      throw new Error('[OptionsScene] updateStatsLabel: "statsLabel" is not a Label');
    }
    prefab.setText(`Total sessions played: ${playCount}`);
  }

  private goBack(): void {
    this.unsubscribe?.();
    this.scene.start('MainMenuScene');
  }
}
