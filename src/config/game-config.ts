import { BootScene } from "@scenes/boot/boot-scene";
import { GameOverScene } from "@scenes/game-over/game-over-scene";
import { GameScene } from "@scenes/game/game-scene";
import { MainMenuScene } from "@scenes/main-menu/main-menu-scene";
import { OptionsScene } from "@scenes/options/options-scene";
import { UIShowcaseScene } from "@scenes/ui-showcase/ui-showcase-scene";
import Phaser from "phaser";
import RexUIPlugin from "phaser3-rex-plugins/templates/ui/ui-plugin.js";

// Game configuration following modular principles
export const createGameConfig = (): Phaser.Types.Core.GameConfig => ({
	type: Phaser.AUTO,
	width: 614,
	height: 1366, //2400
	parent: "game-container",
	backgroundColor: "#2d2d2d",
	physics: {
		default: "arcade",
		arcade: {
			gravity: { x: 0, y: 300 },
			debug: false,
		},
	},
	plugins: {
		scene: [
			{
				key: "rexUI",
				plugin: RexUIPlugin,
				mapping: "rexUI",
			},
		],
	},
	scene: [
		BootScene,
		MainMenuScene,
		GameScene,
		GameOverScene,
		OptionsScene,
		UIShowcaseScene,
	],
	scale: {
		mode: Phaser.Scale.ENVELOP,
		autoCenter: Phaser.Scale.CENTER_BOTH,
	},
});
