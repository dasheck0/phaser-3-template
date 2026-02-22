import { State } from '@systems/finite-state-machine';
import type { GameScene } from '../game-scene';

export class PausedState extends State {
  enter(): void {
    const scene = this.fsm.getContext() as GameScene;
    scene.physics.pause();
  }

  exit(): void {
    const scene = this.fsm.getContext() as GameScene;
    scene.physics.resume();
  }
}
