import { BaseObject } from '../base-object';

export interface IconProgressBarOptions {
  x: number;
  y: number;
  iconKey: string;
  text: string;
  width: number;
  height: number;
  yPadding?: number;
  yOffset?: number;
  borderWidth?: number;
  initialProgress?: number;
  foregroundColor?: number;
  depth?: number;
  fontSize?: number;
}

/**
 * IconProgressBar — a horizontal progress bar with an icon on the left and a text label.
 * Uses native Phaser Graphics and Text objects (no external typography dependency).
 */
export class IconProgressBar extends BaseObject {
  private icon!: Phaser.GameObjects.Sprite;
  private background!: Phaser.GameObjects.Graphics;
  private foreground!: Phaser.GameObjects.Graphics;
  private label!: Phaser.GameObjects.Text;
  private progress!: number;
  private container!: Phaser.GameObjects.Container;

  create(): void {
    const opts = this.options as IconProgressBarOptions;
    this.progress = opts.initialProgress ?? 1;

    const yPadding   = opts.yPadding    ?? 2;
    const yOffset    = opts.yOffset     ?? 0;
    const borderWidth = opts.borderWidth ?? 2;
    const fgColor    = opts.foregroundColor ?? 0x00ff00;
    const depth      = opts.depth ?? 0;

    this.icon       = this.scene.add.sprite(0, opts.height / 2, opts.iconKey).setOrigin(0, 0.5);
    this.background = this.scene.add.graphics();
    this.foreground = this.scene.add.graphics();
    this.label      = this.scene.add.text(0, opts.height / 2, opts.text, { fontSize: `${opts.fontSize ?? 14}px` }).setOrigin(0.5, 0);

    this.container  = this.scene.add.container(opts.x, opts.y, [
      this.background, this.foreground, this.icon, this.label,
    ]);
    this.container.setDepth(depth);

    this.drawBackground(opts, yPadding, yOffset);
    this.drawForeground(opts, yPadding, yOffset, borderWidth, fgColor);
    this.repositionLabel(opts);

    this.addGameObject(this.container);
  }

  setProgress(progress: number): void {
    const opts = this.options as IconProgressBarOptions;
    this.progress = progress;
    this.drawForeground(
      opts,
      opts.yPadding    ?? 2,
      opts.yOffset     ?? 0,
      opts.borderWidth ?? 2,
      opts.foregroundColor ?? 0x00ff00,
    );
  }

  setText(text: string): void {
    this.label.setText(text);
  }

  private drawBackground(
    opts: IconProgressBarOptions,
    yPadding: number,
    yOffset: number,
  ): void {
    const iconWidth = this.icon.width;
    this.background.clear();
    this.background.fillStyle(0x000000, 1);
    this.background.fillRect(
      iconWidth / 2,
      yPadding + yOffset,
      opts.width - iconWidth / 2,
      opts.height - 2 * yPadding,
    );
  }

  private drawForeground(
    opts: IconProgressBarOptions,
    yPadding: number,
    yOffset: number,
    borderWidth: number,
    fgColor: number,
  ): void {
    const iconWidth   = this.icon.width;
    const drawProgress = Math.min(Math.max(this.progress, 0), 1);

    this.foreground.clear();
    this.foreground.fillStyle(fgColor, 1);
    this.foreground.fillRect(
      iconWidth / 2 + borderWidth,
      yPadding + borderWidth + yOffset,
      (opts.width - iconWidth / 2 - 2 * borderWidth) * drawProgress,
      opts.height - 2 * (yPadding + borderWidth),
    );
  }

  private repositionLabel(opts: IconProgressBarOptions): void {
    const iconWidth = this.icon.width;
    this.label.setPosition((iconWidth / 2 + opts.width) / 2, opts.height / 2);
  }
}
