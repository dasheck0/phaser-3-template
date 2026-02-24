import type { PersistenceAdapter } from "./types";

/**
 * LocalStorageAdapter — default persistence backend.
 *
 * Serializes state as JSON into the browser's localStorage.
 * Replace with any other PersistenceAdapter to change the backend.
 */
export const createLocalStorageAdapter = (): PersistenceAdapter => ({
	load: async <T>(key: string): Promise<Partial<T> | null> => {
		try {
			const raw = localStorage.getItem(key);
			return raw ? (JSON.parse(raw) as Partial<T>) : null;
		} catch {
			return null;
		}
	},

	save: async <T>(key: string, state: T): Promise<void> => {
		try {
			localStorage.setItem(key, JSON.stringify(state));
		} catch {
			// Storage quota exceeded or private browsing — fail silently
		}
	},

	clear: async (key: string): Promise<void> => {
		localStorage.removeItem(key);
	},
});
