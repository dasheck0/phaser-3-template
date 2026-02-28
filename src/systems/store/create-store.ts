import { createStore as createZustandStore } from "zustand/vanilla";
import { STORE_NAMESPACE } from "../../config/constants";
import { snakeConcat } from "../../utils/string";
import type {
	Actions,
	MutationMap,
	StoreDefinition,
	StoreInstance,
} from "./types";

/**
 * createStore — the single entry point for defining a new store.
 *
 * Internally wires up a Zustand vanilla store, auto-persists on every
 * change via the provided adapter, and hydrates from it on creation.
 *
 * @example
 * ```ts
 * export const gameStore = createStore({
 *   key: 'game',
 *   adapter: createLocalStorageAdapter(),
 *   state: { playCount: 0, masterVolume: 1 },
 *   mutations: {
 *     incrementPlayCount: (state) => ({ ...state, playCount: state.playCount + 1 }),
 *     setMasterVolume: (state, volume: number) => ({ ...state, masterVolume: volume }),
 *   },
 * });
 * ```
 */
export const createStore = <
	TState extends object,
	TMutations extends MutationMap<TState>,
>(
	definition: StoreDefinition<TState, TMutations>,
): StoreInstance<TState, TMutations> => {
	const { key, adapter, state: initialState, mutations } = definition;

	// Internal Zustand vanilla store — holds the single source of truth
	const zustandStore = createZustandStore<TState>(() => ({ ...initialState }));

	const actualKey = snakeConcat(STORE_NAMESPACE, key);

	// Auto-persist on every state change
	zustandStore.subscribe((state) => {
		adapter.save(actualKey, state);
	});

	// Build typed action dispatchers from the mutations map
	const actions = Object.fromEntries(
		Object.entries(mutations).map(([name, mutation]) => [
			name,
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			(payload?: any) => {
				const current = zustandStore.getState();
				const next = mutation(current, payload);
				zustandStore.setState(next);
			},
		]),
	) as Actions<TState, TMutations>;

	// Hydrate: merge persisted state on top of initial state
	const hydrate = async (): Promise<void> => {
		const persisted = await adapter.load<TState>(actualKey);
		if (persisted) {
			zustandStore.setState({ ...initialState, ...persisted });
		}
	};

	// Reset: restore initial state and wipe the persisted snapshot
	const reset = async (): Promise<void> => {
		zustandStore.setState({ ...initialState });
		await adapter.clear(actualKey);
	};

	// Kick off initial hydration immediately (fire-and-forget)
	hydrate();

	return {
		getState: () => zustandStore.getState(),
		actions,
		subscribe: (listener) => zustandStore.subscribe(listener),
		reset,
		hydrate,
	};
};
