import { Label } from "@prefabs/ui/label";
import { t } from "@systems/i18n";
import { gameStore } from "@systems/store/stores/game-store";
import { BaseScene } from "../base-scene";
import { IdleState } from "./states/idle-state";
import { TransitionState } from "./states/transition-state";

/**
 * MainMenuScene — fully declarative via main-menu.scene.json.
 *
 * Only logic lives here:
 *   - Sync stats label from store
 *   - Wire button callbacks
 *   - Start/stop background music
 */
export class MainMenuScene extends BaseScene {
	constructor() {
		super({ key: "MainMenuScene" });
	}

	protected get scenePath(): string {
		return "/data/scenes/main-menu.scene.json";
	}

	async onCreateReady(): Promise<void> {
		this.initializeBase();
		await this.sceneLoader.loadFromCachedConfig();

		this.fsm.setState("idle");

		const { playCount, masterVolume } = gameStore.getState();
		this.updateStatsLabel(playCount, masterVolume);

		this.wireButton("startButton", () => this.startGame());
		this.wireButton("optionsButton", () => this.showOptions());
		this.wireButton("showcaseButton", () => this.showShowcase());
	}

	protected setupStates(): void {
		this.fsm.addState(new IdleState("idle", this.fsm));
		this.fsm.addState(new TransitionState("transition", this.fsm));
	}

	private wireButton(id: string, callback: () => void): void {
		const prefab = this.sceneLoader.getPrefabById(id);
		if (!(prefab instanceof Label)) {
			throw new Error(
				`[MainMenuScene] wireButton "${id}": prefab is not a Label`,
			);
		}
		(
			prefab.getWidget() as Phaser.GameObjects.GameObject & {
				on: (event: string, fn: () => void) => void;
			}
		).on("click", callback);
	}

	private updateStatsLabel(playCount: number, masterVolume: number): void {
		const prefab = this.sceneLoader.getPrefabById("statsLabel");
		if (!(prefab instanceof Label)) {
			throw new Error(
				'[MainMenuScene] updateStatsLabel: "statsLabel" is not a Label',
			);
		}
		prefab.setText(
			t("mainMenu.stats", {
				playCount,
				masterVolume: masterVolume.toFixed(2),
			}),
		);
	}

	private startGame(): void {
		gameStore.actions.incrementPlayCount();
		this.fsm.setState("transition");
		this.scene.start("GameScene");
	}

	private showOptions(): void {
		this.scene.start("OptionsScene");
	}

	private showShowcase(): void {
		this.scene.start("UIShowcaseScene");
	}
}
