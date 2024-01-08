import { atomWithStorage, createJSONStorage } from 'jotai/utils';

const pageStorage = createJSONStorage(() => sessionStorage);

export interface NavHistory {
	currentPath: string | null;
	settingsBackPath: string | null;
	history: string[];
	storage: typeof pageStorage;
}

const navHistory: NavHistory = {
	currentPath: null,
	settingsBackPath: null,
	history: [],
	storage: pageStorage,
};

export const navHistoryAtom = atomWithStorage('navigationHistory', navHistory);
