import { BaseObject } from '../base-object';

export interface StaticImageOptions {
  x?: number;
  y?: number;
  textureKey: string;
  width?: number;
  height?: number;
  scale?: number;
  scaleX?: number;
  scaleY?: number;
  alpha?: number;
  depth?: number;
  originX?: number;
  originY?: number;
}

export class StaticImage extends BaseObject {
  private image!: Phaser.GameObjects.Image;

  private getDisplaySize(
    sourceWidth: number,
    sourceHeight: number,
    width?: number,
    height?: number,
  ): { width: number; height: number } {
    if (width !== undefined && height !== undefined) {
      return { width, height };
    }
    if (width !== undefined) {
      return { width, height: (sourceHeight / sourceWidth) * width };
    }
    if (height !== undefined) {
      return { width: (sourceWidth / sourceHeight) * height, height };
    }
    return { width: sourceWidth, height: sourceHeight };
  }

  create(): void {
    const opts = this.options as StaticImageOptions;
    const x = opts.x ?? 0;
    const y = opts.y ?? 0;
    const scale = opts.scale ?? 1;
    const hasDisplaySize = opts.width !== undefined || opts.height !== undefined;

    this.image = this.scene.add.image(x, y, opts.textureKey);

    if (hasDisplaySize) {
      const displaySize = this.getDisplaySize(this.image.width, this.image.height, opts.width, opts.height);
      this.image.setDisplaySize(displaySize.width, displaySize.height);
    } else {
      this.image.setScale(opts.scaleX ?? scale, opts.scaleY ?? scale);
    }

    this.image.setAlpha(opts.alpha ?? 1);
    this.image.setDepth(opts.depth ?? 0);
    this.image.setOrigin(opts.originX ?? 0.5, opts.originY ?? 0.5);

    this.addGameObject(this.image);
  }

  getImage(): Phaser.GameObjects.Image {
    return this.image;
  }
}
