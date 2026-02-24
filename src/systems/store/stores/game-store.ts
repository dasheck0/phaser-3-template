import { clamp } from "@/utils/math";
import { createStore } from "../create-store";
import { createLocalStorageAdapter } from "../persistence/local-storage-adapter";

/**
 * GameState — persisted game-wide data.
 *
 * - playCount:    how many times the player has started a game session
 * - masterVolume: global audio volume [0..1]
 */
export interface GameState {
	playCount: number;
	masterVolume: number;
}

const INITIAL_STATE: GameState = {
	playCount: 0,
	masterVolume: 1.0,
};

/**
 * gameStore — singleton store for global game state.
 *
 * Persisted automatically in localStorage under the key "game".
 * Swap `createLocalStorageAdapter()` for any other PersistenceAdapter
 * (e.g. supabaseAdapter) without touching this file's mutations.
 *
 * @example
 * ```ts
 * import { gameStore } from '@systems/store/stores/game-store';
 *
 * // Read
 * const { playCount, masterVolume } = gameStore.getState();
 *
 * // Mutate
 * gameStore.actions.incrementPlayCount();
 * gameStore.actions.setMasterVolume(0.5);
 *
 * // React to changes
 * const unsubscribe = gameStore.subscribe((state) => {
 *   audioSystem.setVolume(state.masterVolume);
 * });
 * ```
 */
export const gameStore = createStore({
	key: "game",
	adapter: createLocalStorageAdapter(),
	state: INITIAL_STATE,

	mutations: {
		incrementPlayCount: (state: GameState): GameState => ({
			...state,
			playCount: state.playCount + 1,
		}),

		setMasterVolume: (state: GameState, volume: number): GameState => ({
			...state,
			masterVolume: clamp(volume),
		}),

		resetPlayCount: (state: GameState): GameState => ({
			...state,
			playCount: 0,
		}),
	},
});
