import { BaseObject } from '../base-object';

export interface PanelOptions {
  x: number;
  y: number;
  width?: number;
  height?: number;
  color?: number;
  alpha?: number;
  strokeColor?: number;
  strokeWidth?: number;
}

/**
 * Panel — rectangle background or divider.
 *
 * options:
 *   x, y          — centre position
 *   width         — in px (default 400)
 *   height        — in px (default 200). Use height 1–2 for a divider.
 *   color         — fill colour as hex number (default 0x1a1a2e)
 *   alpha         — 0–1 fill opacity (default 1)
 *   strokeColor   — outline colour; omit for no outline
 *   strokeWidth   — outline width in px (default 2)
 */
export class Panel extends BaseObject {
  private rectangle!: Phaser.GameObjects.Rectangle;

  create(): void {
    const x           = this.getOption<number>('x', 0);
    const y           = this.getOption<number>('y', 0);
    const width       = this.getOption<number>('width', 400);
    const height      = this.getOption<number>('height', 200);
    const color       = this.getOption<number>('color', 0x1a1a2e);
    const alpha       = this.getOption<number>('alpha', 1);
    const strokeColor = this.getOption<number | null>('strokeColor', null);
    const strokeWidth = this.getOption<number>('strokeWidth', 2);

    this.rectangle = this.scene.add
      .rectangle(x, y, width, height, color, alpha)
      .setOrigin(0.5);

    if (strokeColor !== null) {
      this.rectangle.setStrokeStyle(strokeWidth, strokeColor);
    }

    this.addGameObject(this.rectangle);
  }
}
