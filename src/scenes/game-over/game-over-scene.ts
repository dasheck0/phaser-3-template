import { Label } from '@prefabs/ui/label';
import { BaseScene } from '../base-scene';
import { DisplayState } from './states/display-state';

/**
 * GameOverScene — fully declarative via game-over.scene.json.
 *
 * Only logic lives here:
 *   - Wire restart button → GameScene
 *   - Wire main menu button → MainMenuScene
 */
export class GameOverScene extends BaseScene {
  constructor() {
    super({ key: 'GameOverScene' });
  }

  protected get scenePath(): string {
    return '/data/scenes/game-over.scene.json';
  }

  async onCreateReady(): Promise<void> {
    this.initializeBase();
    await this.sceneLoader.loadFromCachedConfig();

    this.fsm.setState('display');

    this.wireButton('restartButton', () => this.scene.start('GameScene'));
    this.wireButton('menuButton', () => this.scene.start('MainMenuScene'));
  }

  protected setupStates(): void {
    this.fsm.addState(new DisplayState('display', this.fsm));
  }

  private wireButton(id: string, callback: () => void): void {
    const prefab = this.sceneLoader.getPrefabById(id);
    if (!(prefab instanceof Label)) {
      throw new Error(`[GameOverScene] wireButton "${id}": prefab is not a Label`);
    }
    (prefab.getWidget() as Phaser.GameObjects.GameObject & { on: (event: string, fn: () => void) => void })
      .on('click', callback);
  }
}

