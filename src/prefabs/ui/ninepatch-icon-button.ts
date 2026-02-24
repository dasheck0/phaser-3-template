import { NinepatchButton, NinepatchButtonOptions } from './ninepatch-button';

export interface NinepatchIconButtonOptions extends NinepatchButtonOptions {
  iconKey: string;
}

/**
 * NinepatchIconButton — nine-patch button with a centred sprite icon.
 */
export class NinepatchIconButton extends NinepatchButton {
  private icon!: Phaser.GameObjects.Image;

  constructor(scene: Phaser.Scene, options: NinepatchIconButtonOptions) {
    super(scene, options);

    const center = this.getCenter();
    this.icon = scene.add.image(center.x ?? 0, center.y ?? 0, options.iconKey);
    this.icon.setOrigin(0.5, 0.5);
  }

  protected getAnimatableGameObjects(): Phaser.GameObjects.GameObject[] {
    return [this.icon];
  }
}
