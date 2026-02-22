import { State } from '@systems/finite-state-machine';
import type { GameScene } from '../game-scene';

export class GameOverState extends State {
  enter(): void {
    const scene = this.fsm.getContext() as GameScene;
    scene.scene.start('GameOverScene');
  }
}
