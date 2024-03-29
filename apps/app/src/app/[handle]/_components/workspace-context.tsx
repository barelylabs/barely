'use client';

import type { SessionWorkspace } from '@barely/server/auth';
import type { ReactNode } from 'react';
import { WorkspaceContext } from '@barely/lib/context/workspace.context';

export function WorkspaceContextProvider({
	workspace,
	children,
}: {
	children: ReactNode;
	workspace: SessionWorkspace;
}) {
	return (
		<WorkspaceContext.Provider value={workspace}>{children}</WorkspaceContext.Provider>
	);
}
