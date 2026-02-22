import { PersistenceAdapter } from './types';

/**
 * MemoryAdapter — in-process persistence for testing or SSR environments.
 *
 * State lives only as long as the adapter instance — nothing is written to disk.
 */
export const createMemoryAdapter = (): PersistenceAdapter => {
  const store = new Map<string, unknown>();

  return {
    load: async <T>(key: string): Promise<Partial<T> | null> => {
      const value = store.get(key);
      return value !== undefined ? (value as Partial<T>) : null;
    },

    save: async <T>(key: string, state: T): Promise<void> => {
      store.set(key, state);
    },

    clear: async (key: string): Promise<void> => {
      store.delete(key);
    },
  };
};
