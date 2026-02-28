import { createStore } from "../create-store";
import { createLocalStorageAdapter } from "../persistence/local-storage-adapter";

export interface UserState {
	locale: string;
}

const INITIAL_STATE: UserState = {
	locale: "en",
};

export const userStore = createStore({
	key: "user",
	adapter: createLocalStorageAdapter(),
	state: INITIAL_STATE,
	mutations: {
		setLocale: (state: UserState, locale: string): UserState => ({
			...state,
			locale,
		}),
	},
});
