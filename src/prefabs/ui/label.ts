import { BaseObject } from '../base-object';

export interface LabelOptions {
  x: number;
  y: number;
  text?: string;
  fontSize?: number;
  color?: string;
  fontStyle?: string;
  align?: 'left' | 'center' | 'right';
  alpha?: number;
}

/**
 * Label — static or dynamic text element.
 *
 * options:
 *   x, y        — position
 *   text        — display string (default '')
 *   fontSize    — in px (default 16)
 *   color       — CSS colour string (default '#ffffff')
 *   fontStyle   — e.g. 'bold', 'italic' (default '')
 *   align       — 'left' | 'center' | 'right' (default 'center')
 *   alpha       — 0–1 opacity (default 1)
 */
export class Label extends BaseObject {
  private textObject!: Phaser.GameObjects.Text;

  create(): void {
    const x         = this.getOption<number>('x', 0);
    const y         = this.getOption<number>('y', 0);
    const text      = this.getOption<string>('text', '');
    const fontSize  = this.getOption<number>('fontSize', 16);
    const color     = this.getOption<string>('color', '#ffffff');
    const fontStyle = this.getOption<string>('fontStyle', '');
    const align     = this.getOption<'left' | 'center' | 'right'>('align', 'center');
    const alpha     = this.getOption<number>('alpha', 1);

    const originX = align === 'left' ? 0 : align === 'right' ? 1 : 0.5;

    this.textObject = this.scene.add.text(x, y, text, {
      fontSize: `${fontSize}px`,
      color,
      fontStyle,
      align,
    }).setOrigin(originX, 0.5).setAlpha(alpha);

    this.addGameObject(this.textObject);
  }

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  getText(): string {
    return this.textObject.text;
  }

  setText(value: string): void {
    this.textObject.setText(value);
  }
}
