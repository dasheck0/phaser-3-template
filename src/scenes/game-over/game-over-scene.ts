import { Button } from '@prefabs/ui/button';
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

    const restartButton = this.sceneLoader.getPrefabById('restartButton');
    if (restartButton instanceof Button) {
      restartButton.setOnClick(() => this.scene.start('GameScene'));
    }

    const menuButton = this.sceneLoader.getPrefabById('menuButton');
    if (menuButton instanceof Button) {
      menuButton.setOnClick(() => this.scene.start('MainMenuScene'));
    }
  }

  protected setupStates(): void {
    this.fsm.addState(new DisplayState('display', this.fsm));
  }
}
