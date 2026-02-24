export { createStore } from "./create-store";
export { createLocalStorageAdapter } from "./persistence/local-storage-adapter";
export { createMemoryAdapter } from "./persistence/memory-adapter";
export type { PersistenceAdapter } from "./persistence/types";
export type {
	Actions,
	MutationMap,
	StoreDefinition,
	StoreInstance,
} from "./types";
