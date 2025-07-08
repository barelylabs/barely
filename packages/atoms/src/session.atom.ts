import { atomWithStorage, createJSONStorage } from 'jotai/utils';

const pageStorage = createJSONStorage(() => sessionStorage);

interface PageSessionData {
	id: string;
	storage: ReturnType<typeof createJSONStorage>;
}

const pageSession: PageSessionData = {
	id: typeof window !== 'undefined' ? window.crypto.randomUUID() : 'server',
	storage: pageStorage,
};

const pageSessionAtom = atomWithStorage<PageSessionData>('session', pageSession);
type PageSession = PageSessionData;

interface LocalVisitorSessionData {
	id: string;
}

const localVisitorSession: LocalVisitorSessionData = {
	id: typeof window !== 'undefined' ? window.crypto.randomUUID() : 'server',
};

const localVisitorSessionAtom = atomWithStorage<LocalVisitorSessionData>(
	'visitorSession',
	localVisitorSession,
);
type LocalVisitorSession = LocalVisitorSessionData;

export {
	pageSessionAtom,
	type PageSession,
	localVisitorSessionAtom,
	type LocalVisitorSession,
};
