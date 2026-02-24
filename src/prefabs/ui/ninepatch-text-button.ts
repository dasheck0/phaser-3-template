import { NinepatchButton, NinepatchButtonOptions } from './ninepatch-button';

export interface NinepatchTextButtonOptions extends NinepatchButtonOptions {
  text: string;
  fontSize?: number;
  color?: string;
}

/**
 * NinepatchTextButton — nine-patch button with a centred text label.
 */
export class NinepatchTextButton extends NinepatchButton {
  private label!: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, options: NinepatchTextButtonOptions) {
    super(scene, options);

    const center   = this.getCenter();
    const fontSize = `${options.fontSize ?? 16}px`;
    const color    = options.color ?? '#ffffff';

    this.label = scene.add
      .text(center.x ?? 0, center.y ?? 0, options.text, { fontSize, color })
      .setOrigin(0.5, 0.5);
  }

  protected getAnimatableGameObjects(): Phaser.GameObjects.GameObject[] {
    return [this.label];
  }

  setText(text: string): void {
    this.label.setText(text);
  }
}
