import { Label } from '@prefabs/ui/label';
import { BaseScene } from '../base-scene';
import { IdleState } from './states/idle-state';

/**
 * UIShowcaseScene — fully declarative via ui-showcase.scene.json.
 * Logic only: wire back button.
 */
export class UIShowcaseScene extends BaseScene {
  constructor() {
    super({ key: 'UIShowcaseScene' });
  }

  protected get scenePath(): string {
    return '/data/scenes/ui-showcase.scene.json';
  }

  async onCreateReady(): Promise<void> {
    this.initializeBase();
    await this.sceneLoader.loadFromCachedConfig();
    this.fsm.setState('idle');
    this.wireBackButton();
  }

  protected setupStates(): void {
    this.fsm.addState(new IdleState('idle', this.fsm));
  }

  private wireBackButton(): void {
    const prefab = this.sceneLoader.getPrefabById('backButton');
    if (!(prefab instanceof Label)) {
      throw new Error('[UIShowcaseScene] wireBackButton: "backButton" is not a Label');
    }
    (prefab.getWidget() as Phaser.GameObjects.GameObject & { on: (event: string, fn: () => void) => void })
      .on('click', () => this.scene.start('MainMenuScene'));
  }
}
