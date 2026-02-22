import { BaseObject } from './base-object';

export interface BaseSpriteOptions {
  x: number;
  y: number;
  textureKey: string;
  scale?: number;
  scaleX?: number;
  scaleY?: number;
  tint?: number;
  alpha?: number;
  depth?: number;
  originX?: number;
  originY?: number;
}

/**
 * BaseSprite — base class for all image-based prefabs.
 *
 * Wraps a Phaser.GameObjects.Sprite and exposes it to subclasses via
 * `this.sprite`. Subclasses call `super.create()` to build the sprite,
 * then add their own logic on top.
 *
 * options:
 *   textureKey  — Phaser cache key for the loaded image/texture (required)
 *   x, y        — position
 *   scale       — uniform scale (default 1); overridden by scaleX/scaleY
 *   scaleX      — horizontal scale
 *   scaleY      — vertical scale
 *   tint        — hex colour tint (default no tint)
 *   alpha       — 0–1 opacity (default 1)
 *   depth       — render depth (default 0)
 *   originX     — horizontal origin 0–1 (default 0.5)
 *   originY     — vertical origin 0–1 (default 0.5)
 */
export abstract class BaseSprite extends BaseObject {
  protected sprite!: Phaser.GameObjects.Sprite;

  create(): void {
    const x          = this.getOption<number>('x', 0);
    const y          = this.getOption<number>('y', 0);
    const textureKey = this.getOption<string>('textureKey', '__missing');
    const scale      = this.getOption<number>('scale', 1);
    const scaleX     = this.getOption<number>('scaleX', scale);
    const scaleY     = this.getOption<number>('scaleY', scale);
    const alpha      = this.getOption<number>('alpha', 1);
    const depth      = this.getOption<number>('depth', 0);
    const originX    = this.getOption<number>('originX', 0.5);
    const originY    = this.getOption<number>('originY', 0.5);
    const tint       = this.getOption<number | null>('tint', null);

    this.sprite = this.scene.add.sprite(x, y, textureKey);
    this.sprite.setScale(scaleX, scaleY);
    this.sprite.setAlpha(alpha);
    this.sprite.setDepth(depth);
    this.sprite.setOrigin(originX, originY);

    if (tint !== null) {
      this.sprite.setTint(tint);
    }

    this.addGameObject(this.sprite);

    this.setup();
  }

  /**
   * Called after the sprite is created.
   * Subclasses implement their specific logic here instead of overriding create().
   */
  protected abstract setup(): void;

  getSprite(): Phaser.GameObjects.Sprite {
    return this.sprite;
  }
}
