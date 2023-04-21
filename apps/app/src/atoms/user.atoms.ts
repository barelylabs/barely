import { atom } from 'jotai';
import { loadable } from 'jotai/utils';

import { User } from '@barely/db';

import { jotaiApi } from '~/client/trpc';

// const userAtom = jotaiApi.edge.user.current.atomWithQuery();
// const loadableUserAtom = loadable(userAtom);

const userAtom = atom<User | null>(null);

// export { userAtom, loadableUserAtom };
export { userAtom };
