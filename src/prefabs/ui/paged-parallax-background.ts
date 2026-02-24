import { BaseSprite, BaseSpriteOptions } from '../base-sprite';

export interface PagedParallaxBackgroundOptions extends BaseSpriteOptions {
  /** Fixed pixel amount to scroll per page, OR omit to auto-calculate */
  scrollFactor?: number;
  /** If true, scrollFactor is treated as a 0–1 fraction of canvas width */
  scrollFactorRelative?: boolean;
  /** The page index this background starts on */
  startPage: number;
  /** Total number of pages */
  pageCount: number;
  /** Tween duration in ms (default 500) */
  animationDuration?: number;
}

/**
 * PagedParallaxBackground — a sprite that slides horizontally as the user
 * navigates between "pages". Scroll amount is either fixed, relative to
 * canvas width, or auto-calculated from the sprite's visible overflow.
 *
 * Config.getInstance() replaced with scene.scale.width at runtime.
 */
export class PagedParallaxBackground extends BaseSprite {
  private scrollAmount!: number;
  private currentPage!: number;
  private startX!: number;

  protected setup(): void {
    const opts       = this.options as PagedParallaxBackgroundOptions;
    const canvasW    = this.scene.scale.width;

    if (opts.scrollFactor !== undefined) {
      this.scrollAmount = opts.scrollFactorRelative
        ? opts.scrollFactor * canvasW
        : opts.scrollFactor;
    } else {
      this.scrollAmount = this.calculateAutoScroll(opts, canvasW);
    }

    this.currentPage = opts.startPage;
    this.startX      = this.sprite.x;
  }

  scrollToPage(page: number, animate = true): void {
    const targetX    = this.calculateXForPage(page);
    const duration   = (this.options as PagedParallaxBackgroundOptions).animationDuration ?? 500;

    if (animate) {
      this.scene.tweens.add({
        targets: this.sprite,
        x: targetX,
        duration,
        ease: Phaser.Math.Easing.Cubic.InOut,
      });
    } else {
      this.sprite.x = targetX;
    }

    this.currentPage = page;
  }

  getCurrentPage(): number {
    return this.currentPage;
  }

  // ---------------------------------------------------------------------------
  // Private helpers (pure calculations)
  // ---------------------------------------------------------------------------

  private calculateAutoScroll(
    opts: PagedParallaxBackgroundOptions,
    canvasW: number,
  ): number {
    const spriteW              = this.sprite.displayWidth;
    const stepsToRight         = opts.pageCount - 1 - opts.startPage;
    const remainingRight       = spriteW / 2 + this.sprite.x - canvasW;
    const stepsToLeft          = opts.startPage;
    const remainingLeft        = this.sprite.x - spriteW / 2;

    const scrollRight = stepsToRight > 0 ? remainingRight / stepsToRight : 0;
    const scrollLeft  = stepsToLeft  > 0 ? remainingLeft  / stepsToLeft  : 0;

    return Math.max(scrollRight, scrollLeft);
  }

  private calculateXForPage(page: number): number {
    const opts     = this.options as PagedParallaxBackgroundOptions;
    const realIndex = page - opts.startPage;
    return this.startX - realIndex * this.scrollAmount;
  }
}
