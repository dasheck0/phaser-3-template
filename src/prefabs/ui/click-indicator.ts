import { BaseObject } from "../base-object";

export interface ClickIndicatorOptions {
	key: string;
	depth?: number;
	animationDuration?: number;
}

/**
 * ClickIndicator — spawns a ripple sprite at the pointer position on every click,
 * tweens it to scale 2 / alpha 0, then destroys it.
 */
export class ClickIndicator extends BaseObject {
	private enabled = true;

	create(): void {
		this.scene.input.on("pointerdown", this.onPointerDown, this);
	}

	shutdown(): void {
		this.enabled = false;
	}

	enable(): void {
		this.enabled = true;
	}

	destroy(): void {
		this.scene.input.off("pointerdown", this.onPointerDown, this);
		super.destroy();
	}

	private onPointerDown(pointer: Phaser.Input.Pointer): void {
		if (!this.enabled) return;

		const opts = this.options as ClickIndicatorOptions;
		const duration = opts.animationDuration ?? 300;

		const indicator = this.scene.add.image(pointer.x, pointer.y, opts.key);
		indicator.setOrigin(0.5, 0.5);
		indicator.setBlendMode(Phaser.BlendModes.SCREEN);
		if (opts.depth !== undefined) indicator.setDepth(opts.depth);

		this.scene.tweens.add({
			targets: indicator,
			scale: 2,
			alpha: 0,
			duration,
			ease: Phaser.Math.Easing.Quadratic.Out,
			onComplete: () => indicator.destroy(),
		});
	}
}
