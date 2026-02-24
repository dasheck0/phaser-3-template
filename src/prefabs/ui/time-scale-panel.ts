import { BaseObject } from "../base-object";

export interface TimeScalePanelOptions {
	x: number;
	y: number;
	timeScales: number[];
	depth?: number;
	fontSize?: number;
}

/**
 * TimeScalePanel — debug panel with − / + buttons to cycle through time scales.
 * Uses native Phaser Text objects and a RexUI Sizer for layout.
 */
export class TimeScalePanel extends BaseObject {
	private currentIndex = 0;
	private sizer!: Phaser.GameObjects.GameObject;
	private timeScaleText!: Phaser.GameObjects.Text;

	create(): void {
		const opts = this.options as TimeScalePanelOptions;
		const rexUI = (this.scene as any).rexUI;
		const fontSize = `${opts.fontSize ?? 20}px`;
		const depth = opts.depth ?? 0;

		const decreaseText = this.scene.add.text(0, 0, "-", { fontSize });
		const increaseText = this.scene.add.text(0, 0, "+", { fontSize });
		this.timeScaleText = this.scene.add.text(
			0,
			0,
			this.currentScale(opts).toString(),
			{ fontSize },
		);

		const decreaseButtons = rexUI.add
			.buttons({ buttons: [decreaseText] })
			.on("button.click", () => this.decreaseTimeScale());

		const increaseButtons = rexUI.add
			.buttons({ buttons: [increaseText] })
			.on("button.click", () => this.increaseTimeScale());

		this.sizer = rexUI.add
			.sizer({
				orientation: "x",
				x: opts.x,
				y: opts.y,
				space: { left: 10, right: 10, top: 10, bottom: 10, item: 10 },
			})
			.add(decreaseButtons)
			.add(this.timeScaleText)
			.add(increaseButtons)
			.setDepth(depth)
			.layout();

		this.applyCurrentTimeScale(opts);
		this.addGameObject(this.sizer as Phaser.GameObjects.GameObject);
	}

	increaseTimeScale(): void {
		const opts = this.options as TimeScalePanelOptions;
		this.currentIndex = (this.currentIndex + 1) % opts.timeScales.length;
		this.applyCurrentTimeScale(opts);
	}

	decreaseTimeScale(): void {
		const opts = this.options as TimeScalePanelOptions;
		this.currentIndex =
			(this.currentIndex - 1 + opts.timeScales.length) % opts.timeScales.length;
		this.applyCurrentTimeScale(opts);
	}

	getCurrentTimeScale(): number {
		return this.currentScale(this.options as TimeScalePanelOptions);
	}

	private currentScale(opts: TimeScalePanelOptions): number {
		return opts.timeScales[this.currentIndex];
	}

	private applyCurrentTimeScale(opts: TimeScalePanelOptions): void {
		const scale = this.currentScale(opts);
		this.scene.time.timeScale = scale;
		this.scene.tweens.timeScale = scale;
		this.timeScaleText.setText(scale.toString());
	}
}
