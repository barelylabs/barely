import type { SessionWorkspace } from '@barely/auth';
import { atom } from 'jotai';

export const workspaceAtom = atom<SessionWorkspace | null>(null);
