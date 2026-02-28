import { BaseObject } from "../base-object";

export interface LanguageChoice {
	locale: string;
	key: string;
}

export interface LanguageChooserOptions {
	x?: number;
	y?: number;
	activeLocale?: string;
	options: LanguageChoice[];
	columns?: number;
	gridWidth?: number;
	cellPadding?: number;
	iconPadding?: number;
	indicatorShape?: "square" | "circle";
	activeBorderColor?: number;
	activeBorderWidth?: number;
	inactiveBorderColor?: number;
	inactiveBorderWidth?: number;
	backgroundColor?: number;
	backgroundAlpha?: number;
	depth?: number;
}

type LanguageChangeHandler = (locale: string) => void | Promise<void>;

interface LanguageCell {
	container: Phaser.GameObjects.Container;
	indicator: Phaser.GameObjects.Shape;
	hitZone: Phaser.GameObjects.Zone;
}

export class LanguageChooser extends BaseObject {
	private root!: Phaser.GameObjects.Container;
	private cells!: Map<string, LanguageCell>;
	private optionsData!: LanguageChoice[];
	private activeLocale!: string;
	private onChange?: LanguageChangeHandler;
	private cellSize!: number;
	private gap!: number;
	private columns!: number;

	create(): void {
		const opts = this.options as LanguageChooserOptions;
		this.cells = new Map<string, LanguageCell>();
		this.optionsData = [];
		this.activeLocale = "en";
		this.cellSize = 48;
		this.gap = Math.max(0, opts.cellPadding ?? 8);
		this.columns = Math.max(1, Math.floor(opts.columns ?? 2));

		this.optionsData = opts.options;
		if (this.optionsData.length === 0) {
			throw new Error("[LanguageChooser] options must not be empty");
		}

		this.activeLocale =
			opts.activeLocale ?? this.optionsData[0]?.locale ?? this.activeLocale;

		this.root = this.scene.add.container(opts.x ?? 0, opts.y ?? 0);
		if (opts.depth !== undefined) {
			this.root.setDepth(opts.depth);
		}
		this.addGameObject(this.root);

		const gridWidth = Math.max(32, Math.floor(opts.gridWidth ?? 112));
		const totalGapWidth = this.gap * (this.columns - 1);
		const calculatedCellSize = Math.floor(
			(gridWidth - totalGapWidth) / this.columns,
		);
		this.cellSize = Math.max(24, calculatedCellSize);

		const totalRows = Math.ceil(this.optionsData.length / this.columns);
		const totalWidth =
			this.columns * this.cellSize + (this.columns - 1) * this.gap;
		const totalHeight = totalRows * this.cellSize + (totalRows - 1) * this.gap;
		const startX = -totalWidth / 2 + this.cellSize / 2;
		const startY = -totalHeight / 2 + this.cellSize / 2;

		this.optionsData.forEach((option, index) => {
			const col = index % this.columns;
			const row = Math.floor(index / this.columns);
			const x = startX + col * (this.cellSize + this.gap);
			const y = startY + row * (this.cellSize + this.gap);

			const cell = this.createLocaleCell(option.locale);
			cell.container.setPosition(x, y);
			cell.hitZone.on("pointerdown", () => {
				void this.handleLocaleSelect(option.locale);
			});

			this.cells.set(option.locale, cell);
			this.root.add(cell.container);
		});

		this.updateActiveStyles();
	}

	setOnChange(handler: LanguageChangeHandler): void {
		this.onChange = handler;
	}

	setActiveLocale(locale: string): void {
		if (!this.optionsData.some((option) => option.locale === locale)) {
			return;
		}

		this.activeLocale = locale;
		this.updateActiveStyles();
	}

	private async handleLocaleSelect(locale: string): Promise<void> {
		this.setActiveLocale(locale);

		if (!this.onChange) {
			return;
		}

		await this.onChange(locale);
	}

	private updateActiveStyles(): void {
		const opts = this.options as LanguageChooserOptions;
		const activeBorderColor = opts.activeBorderColor ?? 0x66ccff;
		const activeBorderWidth = opts.activeBorderWidth ?? 3;
		const inactiveBorderColor = opts.inactiveBorderColor ?? 0x5c5c6d;
		const inactiveBorderWidth = opts.inactiveBorderWidth ?? 1;

		this.optionsData.forEach((option) => {
			const cell = this.cells.get(option.locale);
			if (!cell) {
				return;
			}

			const isActive = option.locale === this.activeLocale;
			cell.indicator.setStrokeStyle(
				isActive ? activeBorderWidth : inactiveBorderWidth,
				isActive ? activeBorderColor : inactiveBorderColor,
				1,
			);
			cell.container.setAlpha(isActive ? 1 : 0.85);
		});
	}

	private createLocaleCell(locale: string): LanguageCell {
		const opts = this.options as LanguageChooserOptions;
		const option = this.optionsData.find((item) => item.locale === locale);
		if (!option) {
			throw new Error(
				`[LanguageChooser] option not found for locale "${locale}"`,
			);
		}

		const container = this.scene.add.container(0, 0);
		const background = this.scene.add.rectangle(
			0,
			0,
			this.cellSize,
			this.cellSize,
			opts.backgroundColor ?? 0x1f1f2f,
			opts.backgroundAlpha ?? 0.9,
		);
		background.setOrigin(0.5, 0.5);

		const indicator = this.createIndicatorShape(opts);

		container.add([background, indicator]);

		const key = option.key;
		const iconPadding = Math.max(0, opts.iconPadding ?? 8);
		const maxIconSize = this.cellSize - iconPadding * 2;

		if (this.scene.textures.exists(key)) {
			const image = this.scene.add.image(0, 0, key);
			image.setOrigin(0.5, 0.5);
			const scale = Math.min(
				maxIconSize / image.width,
				maxIconSize / image.height,
			);
			image.setScale(scale);
			container.add(image);
		} else {
			const label = this.scene.add.text(0, 0, locale.toUpperCase(), {
				fontSize: "14px",
				color: "#ffffff",
			});
			label.setOrigin(0.5, 0.5);
			const fit = Math.min(
				maxIconSize / label.width,
				maxIconSize / label.height,
				1,
			);
			label.setScale(fit);
			container.add(label);
		}

		const hitZone = this.scene.add.zone(0, 0, this.cellSize, this.cellSize);
		hitZone.setOrigin(0.5, 0.5);
		hitZone.setInteractive({ useHandCursor: true });
		container.add(hitZone);

		container.setSize(this.cellSize, this.cellSize);

		return { container, indicator, hitZone };
	}

	private createIndicatorShape(
		opts: LanguageChooserOptions,
	): Phaser.GameObjects.Shape {
		const indicatorShape = opts.indicatorShape ?? "square";
		if (indicatorShape === "circle") {
			const radius = this.cellSize / 2;
			const circle = this.scene.add.circle(0, 0, radius);
			circle.setFillStyle(0x000000, 0);
			return circle;
		}

		const rectangle = this.scene.add.rectangle(
			0,
			0,
			this.cellSize,
			this.cellSize,
		);
		rectangle.setOrigin(0.5, 0.5);
		rectangle.setFillStyle(0x000000, 0);
		return rectangle;
	}
}
