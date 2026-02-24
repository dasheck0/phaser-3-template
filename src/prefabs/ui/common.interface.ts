export interface RexUILabel {
	x?: number;
	y?: number;
	anchor?: RexUIAnchor;
	width?: number;
	height?: number;
	orientation?: string | number;
	background?: Phaser.GameObjects.GameObject;
	icon?: Phaser.GameObjects.GameObject;
	text?: Phaser.GameObjects.GameObject;
	expandTextWidth?: boolean;
	expandTextHeight?: boolean;
	action?: Phaser.GameObjects.GameObject;
	actionMask?: boolean;
	align?: string;
	space?: RexUISpace;
	name?: string;
	draggable?: boolean;
}

export interface RexUIAnchor {
	left?: string;
	right?: string;
	centerX?: string;
	x?: string;
	top?: string;
	bottom?: string;
	centerY?: string;
	y?: string;
}

export interface RexUISpace {
	left?: number;
	right?: number;
	top?: number;
	bottom?: number;
	icon?: number;
	text?: number;
}
