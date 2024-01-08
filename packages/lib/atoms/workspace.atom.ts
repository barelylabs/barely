import { atom } from 'jotai';

import { SessionWorkspace } from '../server/auth';

export const workspaceAtom = atom<SessionWorkspace | null>(null);
