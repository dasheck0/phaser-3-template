import { BaseObject } from '../base-object';
import type { RexUIAnchor } from './common.interface';

export interface ImageToggleButtonOptions {
  key: string;
  keyInactive: string;
  buttonAnchor: RexUIAnchor;
  orientation?: string;
  width: number;
  height: number;
  onClick?: (isActive: boolean) => void;
}

/**
 * ImageToggleButton — single sprite button that toggles between two textures on click.
 */
export class ImageToggleButton extends BaseObject {
  private button!: Phaser.GameObjects.GameObject | null;
  private icon!: Phaser.GameObjects.Sprite;
  private isActive = true;
  private onClick?: (isActive: boolean) => void;

  create(): void {
    const opts = this.options as ImageToggleButtonOptions;
    this.onClick = opts.onClick;

    const rexUI = (this.scene as any).rexUI;
    this.icon = this.scene.add.sprite(0, 0, opts.key);

    this.button = rexUI.add
      .buttons({
        anchor: opts.buttonAnchor,
        orientation: opts.orientation ?? 'y',
        buttons: [
          rexUI.add.label({
            width: this.icon.width,
            height: this.icon.height,
            icon: this.icon,
            iconMask: false,
            space: {},
          }),
        ],
      })
      .layout();

    (this.button as Phaser.Events.EventEmitter).on(
      'button.click',
      (button: Phaser.GameObjects.GameObject) => {
        this.isActive = !this.isActive;

        this.scene.tweens.add({
          targets: button,
          scale: (button as any).scale * 1.1,
          duration: 50,
          repeat: 0,
          yoyo: true,
          ease: 'Cubic',
          onComplete: () => {
            this.icon.setTexture(this.isActive ? opts.key : opts.keyInactive);
          },
        });

        this.onClick?.(this.isActive);
      },
    );

    this.addGameObject(this.button as Phaser.GameObjects.GameObject);
  }

  setOnClick(fn: (isActive: boolean) => void): void {
    this.onClick = fn;
  }

  getIsActive(): boolean {
    return this.isActive;
  }
}
