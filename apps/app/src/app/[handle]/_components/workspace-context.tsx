'use client';

import type { SessionWorkspace } from '@barely/auth';
import type { ReactNode } from 'react';
import { createContext } from 'react';
import { parseAsBoolean, useQueryState } from 'nuqs';

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

export function useWorkspaceModalState() {
	const [showNewWorkspaceModal, setShowNewWorkspaceModal] = useQueryState(
		'newWorkspace',
		parseAsBoolean.withDefault(false),
	);

	return {
		showNewWorkspaceModal,
		setShowNewWorkspaceModal,
	};
}
