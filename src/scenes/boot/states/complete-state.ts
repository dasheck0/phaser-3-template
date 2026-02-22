import { State } from '@systems/finite-state-machine';

export class CompleteState extends State {
  enter(): void {
    console.log('Boot: Complete');
  }
}
