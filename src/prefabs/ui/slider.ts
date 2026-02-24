import { BaseObject } from '../base-object';

export interface SliderOptions {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  orientation?: 'x' | 'y' | 0 | 1;
  value?: number;
  min?: number;
  max?: number;
  track?: { width?: number; height?: number; radius?: number; color?: number };
  thumb?: { width?: number; height?: number; radius?: number; color?: number };
  input?: 'drag' | 'click' | 'none';
}

/**
 * Slider — RexUI slider widget.
 * Registers as 'Slider' in PrefabManager; use { "type": "Slider" } in scene JSON.
 */
export class Slider extends BaseObject {
  private widget!: Phaser.GameObjects.GameObject;

  create(): void {
    const opts = this.options as SliderOptions;
    const rexUI = (this.scene as any).rexUI;
    const x = opts.x ?? 0;
    const y = opts.y ?? 0;

    const track = opts.track
      ? rexUI.add.roundRectangle({
          width: opts.track.width,
          height: opts.track.height,
          radius: opts.track.radius ?? 0,
          color: opts.track.color ?? 0x444444,
        })
      : undefined;

    const thumb = opts.thumb
      ? rexUI.add.roundRectangle({
          width: opts.thumb.width,
          height: opts.thumb.height,
          radius: opts.thumb.radius ?? 0,
          color: opts.thumb.color ?? 0xffffff,
        })
      : undefined;

    this.widget = rexUI.add.slider({
      x,
      y,
      width: opts.width,
      height: opts.height,
      orientation: opts.orientation ?? 'x',
      value: opts.value ?? 0,
      min: opts.min ?? 0,
      max: opts.max ?? 1,
      track,
      thumb,
      input: opts.input ?? 'drag',
    }).layout() as unknown as Phaser.GameObjects.GameObject;

    this.addGameObject(this.widget);
  }

  getWidget(): Phaser.GameObjects.GameObject {
    return this.widget;
  }

  setValue(value: number): void {
    (this.widget as any).setValue(value);
  }
}
