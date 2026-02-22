import { State } from '@systems/finite-state-machine';

export class LoadingState extends State {
  enter(): void {
    console.log('Boot: Loading');
  }
}
