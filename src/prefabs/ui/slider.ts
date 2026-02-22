import { clamp, normalize } from '@/utils/math';
import { BaseObject } from '../base-object';

export interface SliderOptions {
  x: number;
  y: number;
  width?: number;
  height?: number;
  min?: number;
  max?: number;
  value?: number;
  trackColor?: number;
  handleColor?: number;
  handleRadius?: number;
  onChange?: (value: number) => void;
}

/**
 * Slider — draggable UI control that maps a handle position to a [min, max] value.
 *
 * options:
 *   x, y          — centre of the track
 *   width         — track length in px (default 300)
 *   height        — track thickness in px (default 8)
 *   min           — minimum value (default 0)
 *   max           — maximum value (default 1)
 *   value         — initial value (default min)
 *   trackColor    — track fill colour (default 0x555555)
 *   handleColor   — handle fill colour (default 0x4a90e2)
 *   handleRadius  — handle circle radius (default 14)
 *   onChange      — called every time the value changes during drag
 */
export class Slider extends BaseObject {
  private track!: Phaser.GameObjects.Rectangle;
  private fill!: Phaser.GameObjects.Rectangle;
  private handle!: Phaser.GameObjects.Arc;
  private label!: Phaser.GameObjects.Text;

  private min!: number;
  private max!: number;
  private currentValue!: number;
  private trackX!: number;
  private trackWidth!: number;
  private onChange!: ((value: number) => void) | null;

  create(): void {
    const x            = this.getOption<number>('x', 0);
    const y            = this.getOption<number>('y', 0);
    const width        = this.getOption<number>('width', 300);
    const height       = this.getOption<number>('height', 8);
    const trackColor   = this.getOption<number>('trackColor', 0x555555);
    const handleColor  = this.getOption<number>('handleColor', 0x4a90e2);
    const handleRadius = this.getOption<number>('handleRadius', 14);

    this.min          = this.getOption<number>('min', 0);
    this.max          = this.getOption<number>('max', 1);
    this.currentValue = clamp(this.getOption<number>('value', this.min), this.min, this.max);
    this.onChange     = this.getOption<((v: number) => void) | null>('onChange', null);

    this.trackX     = x - width / 2;
    this.trackWidth = width;

    // Track background
    this.track = this.scene.add.rectangle(x, y, width, height, trackColor);
    this.track.setOrigin(0.5, 0.5);

    // Filled portion (left of handle)
    this.fill = this.scene.add.rectangle(this.trackX, y, 0, height, handleColor);
    this.fill.setOrigin(0, 0.5);

    // Value label (right of track)
    this.label = this.scene.add.text(x + width / 2 + 20, y, this.formatValue(), {
      fontSize: '18px',
      color: '#ffffff',
    }).setOrigin(0, 0.5);

    // Handle
    const handleX = this.valueToX(this.currentValue);
    this.handle = this.scene.add.circle(handleX, y, handleRadius, handleColor);
    this.handle.setInteractive({ useHandCursor: true, draggable: true });

    this.scene.input.setDraggable(this.handle);
    this.handle.on('drag', (_pointer: Phaser.Input.Pointer, dragX: number) => {
      this.setHandleX(dragX);
    });

    // Click anywhere on the track to jump
    this.track.setInteractive({ useHandCursor: true });
    this.track.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.setHandleX(pointer.x);
    });

    this.updateFill();

    this.addGameObject(this.track);
    this.addGameObject(this.fill);
    this.addGameObject(this.handle);
    this.addGameObject(this.label);
  }

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  getValue(): number {
    return this.currentValue;
  }

  /** Programmatically set the slider value without triggering onChange. */
  setValue(value: number): void {
    if (!this.fill?.active || !this.handle?.active || !this.label?.active) return;
    this.currentValue = clamp(value, this.min, this.max);
    this.handle.setX(this.valueToX(this.currentValue));
    this.updateFill();
    this.label.setText(this.formatValue());
  }

  setOnChange(cb: (value: number) => void): void {
    this.onChange = cb;
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  private setHandleX(rawX: number): void {
    const x = clamp(rawX, this.trackX, this.trackX + this.trackWidth);
    this.currentValue = this.xToValue(x);
    this.handle.setX(x);
    this.updateFill();
    this.label.setText(this.formatValue());
    this.onChange?.(this.currentValue);
  }

  private valueToX(value: number): number {
    const t = normalize(value, this.min, this.max);
    return this.trackX + t * this.trackWidth;
  }

  private xToValue(x: number): number {
    const t = normalize(x, this.trackX, this.trackX + this.trackWidth);
    return this.min + t * (this.max - this.min);
  }

  private updateFill(): void {
    if (!this.fill?.active) return;
    const fillWidth = this.valueToX(this.currentValue) - this.trackX;
    this.fill.setSize(Math.max(0, fillWidth), this.fill.height);
  }

  private formatValue(): string {
    // Show 0–100% for [0,1] ranges, raw number otherwise
    if (this.min === 0 && this.max === 1) {
      return `${Math.round(this.currentValue * 100)}%`;
    }
    return String(Math.round(this.currentValue));
  }
}
