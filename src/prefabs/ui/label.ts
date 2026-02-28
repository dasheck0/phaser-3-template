import { t } from "@systems/i18n";
import { BaseObject } from "../base-object";

export interface LabelOptions {
	x?: number;
	y?: number;
	text: string;
	style?: Phaser.Types.GameObjects.Text.TextStyle;
	background?: {
		radius?: number;
		color?: number;
		strokeColor?: number;
		strokeWidth?: number;
		alpha?: number;
	};
	space?: { left?: number; right?: number; top?: number; bottom?: number };
	align?: string;
	setInteractive?: boolean;
}

/**
 * Label — RexUI label wrapping text with optional rounded-rect background.
 * Registers as 'Label' in PrefabManager; use { "type": "Label" } in scene JSON.
 */
export class Label extends BaseObject {
	private widget!: Phaser.GameObjects.GameObject;

	create(): void {
		const opts = this.options as LabelOptions;
		const rexUI = (this.scene as any).rexUI;
		const x = opts.x ?? 0;
		const y = opts.y ?? 0;

		const bg = opts.background
			? rexUI.add.roundRectangle({
					radius: opts.background.radius ?? 0,
					color: opts.background.color ?? 0x000000,
					strokeColor: opts.background.strokeColor,
					strokeWidth: opts.background.strokeWidth,
					alpha: opts.background.alpha,
				})
			: undefined;

		const textObj = this.scene.add.text(
			0,
			0,
			t(opts.text ?? ""),
			opts.style ?? {},
		);

		const label = rexUI.add
			.label({
				x,
				y,
				background: bg,
				text: textObj,
				space: opts.space ?? {},
				align: opts.align,
			})
			.layout();

		if (opts.setInteractive) {
			const w = (label as any).width as number;
			const h = (label as any).height as number;
			const click = rexUI.add.click(label as Phaser.GameObjects.GameObject);
			(label as Phaser.GameObjects.GameObject).setInteractive(
				new Phaser.Geom.Rectangle(0, 0, w, h),
				Phaser.Geom.Rectangle.Contains,
			);
			click.on("click", () => {
				(label as Phaser.Events.EventEmitter).emit("click", label);
			});
		}

		this.widget = label as unknown as Phaser.GameObjects.GameObject;
		this.addGameObject(this.widget);
	}

	getWidget(): Phaser.GameObjects.GameObject {
		return this.widget;
	}

	setText(text: string): void {
		(this.widget as any).setText(text);
	}
}
