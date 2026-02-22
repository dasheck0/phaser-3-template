import { PersistenceAdapter } from './persistence/types';

/**
 * A mutation is a pure function: (currentState, payload?) => nextState.
 * The payload type is inferred automatically from the function signature.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Mutation<TState, TPayload = void> = TPayload extends void
  ? (state: TState) => TState
  : (state: TState, payload: TPayload) => TState;

/**
 * Map of named mutations for a store.
 * Each value is a Mutation function; payload type is inferred per entry.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type MutationMap<TState> = Record<string, (state: TState, payload?: any) => TState>;

/**
 * Derives the Actions API from a MutationMap.
 * Each mutation becomes a callable action — with or without payload.
 */
export type Actions<TState, TMutations extends MutationMap<TState>> = {
  [K in keyof TMutations]: TMutations[K] extends (state: TState) => TState
    ? () => void
    : TMutations[K] extends (state: TState, payload: infer P) => TState
      ? (payload: P) => void
      : never;
};

/**
 * Definition object passed to createStore().
 * This is the only thing an application developer needs to write.
 */
export interface StoreDefinition<TState, TMutations extends MutationMap<TState>> {
  /** Unique key used for persistence (e.g. localStorage key). */
  key: string;

  /** Storage backend — swap to change persistence strategy. */
  adapter: PersistenceAdapter;

  /** Initial state — used when nothing is persisted yet. */
  state: TState;

  /** Pure mutation functions that produce a new state. */
  mutations: TMutations;
}

/**
 * The public interface of a store instance returned by createStore().
 */
export interface StoreInstance<TState, TMutations extends MutationMap<TState>> {
  /** Returns the current state snapshot (synchronous). */
  getState: () => TState;

  /** Typed action dispatchers — one per mutation. */
  actions: Actions<TState, TMutations>;

  /**
   * Subscribe to state changes.
   * Returns an unsubscribe function — call it to stop listening.
   */
  subscribe: (listener: (state: TState) => void) => () => void;

  /**
   * Reset state to its initial value and clear the persisted snapshot.
   */
  reset: () => Promise<void>;

  /**
   * Manually trigger a load from the persistence adapter.
   * Called automatically on creation; expose for explicit re-hydration.
   */
  hydrate: () => Promise<void>;
}
