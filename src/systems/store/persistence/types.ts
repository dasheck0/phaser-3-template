/**
 * PersistenceAdapter — contract for all storage backends.
 *
 * Implement this interface to swap out storage (LocalStorage, Supabase, etc.)
 * without touching any store or game logic.
 */
export interface PersistenceAdapter {
	/** Load a previously saved state snapshot, or null if nothing is stored yet. */
	load<T>(key: string): Promise<Partial<T> | null>;

	/** Persist the current state snapshot under the given key. */
	save<T>(key: string, state: T): Promise<void>;

	/** Remove a stored snapshot. */
	clear(key: string): Promise<void>;
}
