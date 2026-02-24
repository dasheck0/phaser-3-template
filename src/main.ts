import { createGameConfig } from "@config/game-config";
import Phaser from "phaser";
// Import prefab registry to trigger registration
import "@prefabs/index";

declare global {
	interface Window {
		__SCENE_SNAPSHOTS_GAME__?: Phaser.Game;
	}
}

/**
 * Application Entry Point
 * Initializes Phaser game with modular configuration
 */

// Initialize game when DOM is ready
window.addEventListener("load", () => {
	const config = createGameConfig();
	const game = new Phaser.Game(config);

	const isSceneSnapshotMode = new URLSearchParams(window.location.search).get(
		"__sceneSnapshots",
	);
	if (isSceneSnapshotMode === "1") {
		window.__SCENE_SNAPSHOTS_GAME__ = game;
	}
});
