import { atom } from "jotai";

import type { SessionWorkspace } from "../server/auth";

export const workspaceAtom = atom<SessionWorkspace | null>(null);
