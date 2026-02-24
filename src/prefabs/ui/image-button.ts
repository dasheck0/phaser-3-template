import { BaseObject } from "../base-object";
import type { RexUIAnchor } from "./common.interface";

export interface ImageButtonOptions {
	key: string;
	buttonAnchor: RexUIAnchor;
	orientation?: string;
	width: number;
	height: number;
	clickScaleMultiplier?: number;
	onClick?: () => void;
}

/**
 * ImageButton — RexUI buttons wrapper for a single sprite-based clickable button.
 * Plays a scale tween on click, then fires the onClick callback.
 */
export class ImageButton extends BaseObject {
	// No initializer — BaseObject calls create() before subclass fields initialise
	private button!: Phaser.GameObjects.GameObject | null;
	private onClick?: () => void;

	create(): void {
		const opts = this.options as ImageButtonOptions;
		this.onClick = opts.onClick;

		const rexUI = (this.scene as any).rexUI;
		const image = this.scene.add.sprite(0, 0, opts.key);

		this.button = rexUI.add
			.buttons({
				anchor: opts.buttonAnchor,
				orientation: opts.orientation ?? "y",
				buttons: [
					rexUI.add.label({
						width: image.width,
						height: image.height,
						icon: image,
						iconMask: false,
						space: {},
					}),
				],
			})
			.layout();

		(this.button as Phaser.Events.EventEmitter).on(
			"button.click",
			(button: Phaser.GameObjects.GameObject) => {
				const multiplier = opts.clickScaleMultiplier ?? 1.1;
				this.scene.tweens.add({
					targets: button,
					scale: (button as any).scale * multiplier,
					duration: 50,
					repeat: 0,
					yoyo: true,
					ease: "Cubic",
				});
				this.onClick?.();
			},
		);

		this.addGameObject(this.button as Phaser.GameObjects.GameObject);
	}

	setOnClick(fn: () => void): void {
		this.onClick = fn;
	}

	getButton(): Phaser.GameObjects.GameObject {
		if (!this.button)
			throw new Error(`[ImageButton] "${this.name}": button not created`);
		return this.button as Phaser.GameObjects.GameObject;
	}
}
