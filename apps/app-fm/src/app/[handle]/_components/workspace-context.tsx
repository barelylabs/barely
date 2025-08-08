'use client';

import type { SessionWorkspace } from '@barely/auth';
import type { ReactNode } from 'react';
import { createContext } from 'react';

export const WorkspaceContext = createContext<SessionWorkspace | null>(null);

export function WorkspaceContextProvider({
	workspace,
	children,
}: {
	workspace: SessionWorkspace;
	children: ReactNode;
}) {
	return (
		<WorkspaceContext.Provider value={workspace}>{children}</WorkspaceContext.Provider>
	);
}
