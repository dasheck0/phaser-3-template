import NinePatch from "phaser3-rex-plugins/plugins/ninepatch";

export interface NinepatchButtonOptions {
	x: number;
	y: number;
	/** Whether x/y are expressed as 0–1 fractions of the canvas size */
	relative?: boolean;
	anchorX?: number;
	anchorY?: number;
	width: number;
	height: number;
	/** Texture key for the nine-patch image */
	key: string;
	onClick?: () => void;
}

const CORNER_SIZE = 34;

/**
 * NinepatchButton — abstract base for nine-patch–backed clickable buttons.
 *
 * Resolves position from relative (0–1) or absolute pixel coords using
 * `scene.scale.width / height` — no Config singleton needed.
 *
 * Subclasses implement `getAnimatableGameObjects()` to include their
 * child objects in the click scale tween.
 */
export abstract class NinepatchButton extends NinePatch {
	protected onClick?: () => void;
	private isAnimating = false;

	constructor(scene: Phaser.Scene, options: NinepatchButtonOptions) {
		super(
			scene,
			0,
			0,
			options.width,
			options.height,
			options.key,
			[CORNER_SIZE, undefined, CORNER_SIZE],
			[CORNER_SIZE, undefined, CORNER_SIZE],
		);

		const pos = resolvePosition(scene, options);
		this.setPosition(pos.x, pos.y);

		this.onClick = options.onClick;

		this.setInteractive();
		this.on("pointerup", () => {
			if (this.isAnimating) return;
			this.isAnimating = true;

			scene.tweens.add({
				targets: [this, ...this.getAnimatableGameObjects()],
				scaleX: 1.1,
				scaleY: 1.1,
				duration: 50,
				yoyo: true,
				onComplete: () => {
					this.onClick?.();
					this.isAnimating = false;
				},
			});
		});

		scene.add.existing(this);
	}

	setOnClick(fn: () => void): void {
		this.onClick = fn;
	}

	/** Return child game objects that should be included in the click tween. */
	protected abstract getAnimatableGameObjects(): Phaser.GameObjects.GameObject[];
}

// ---------------------------------------------------------------------------
// Pure helper — no side effects
// ---------------------------------------------------------------------------

function resolvePosition(
	scene: Phaser.Scene,
	opts: NinepatchButtonOptions,
): { x: number; y: number } {
	const rawX = opts.relative ? opts.x * scene.scale.width : opts.x;
	const rawY = opts.relative ? opts.y * scene.scale.height : opts.y;

	const anchorOffsetX = ((opts.anchorX ?? 0.5) - 0.5) * opts.width;
	const anchorOffsetY = ((opts.anchorY ?? 0.5) - 0.5) * opts.height;

	return { x: rawX - anchorOffsetX, y: rawY - anchorOffsetY };
}
