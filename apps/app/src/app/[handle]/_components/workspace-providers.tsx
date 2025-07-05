'use client';

import type { SessionUser, SessionWorkspace } from '@barely/auth';
import type { ReactNode } from 'react';
import { workspaceAtom } from '@barely/atoms';
import { UserContext, useUpdateNavHistory, useWorkspaceHotkeys } from '@barely/hooks';
import { useHydrateAtoms } from 'jotai/utils';

import { ThemeProvider } from '@barely/ui/next-theme-provider';

interface UserContextProviderProps {
	user: SessionUser;
	children: ReactNode | JSX.Element;
}

export const UserContextProvider = (props: UserContextProviderProps) => {
	return <UserContext.Provider value={props.user}>{props.children}</UserContext.Provider>;
};

interface WorkspaceContextProviderProps {
	workspace: SessionWorkspace;
	children: ReactNode | JSX.Element;
	// setWorkspace: (workspace: SessionWorkspace) => void;
}

export function WorkspaceContextProvider({
	workspace,
	children,
}: WorkspaceContextProviderProps) {
	useWorkspaceHotkeys({ workspace });

	// const wsAtom = useMemo(() => workspaceAtom(workspace), [workspace])

	// we hydrate from the server, and then we update the workspace atom from the client from there.
	useHydrateAtoms([[workspaceAtom, workspace]]);

	return (
		// <WorkspaceContext.Provider value={workspace}>{children}</WorkspaceContext.Provider>
		<>{children}</>
	);
}

function WorkspaceUpdateNavHistory({ children }: { children: ReactNode }) {
	useUpdateNavHistory();
	return <>{children}</>;
}

export function WorkspaceProviders(
	props: UserContextProviderProps & WorkspaceContextProviderProps,
) {
	return (
		<ThemeProvider attribute='class' defaultTheme='system' enableSystem>
			<UserContextProvider user={props.user}>
				<WorkspaceContextProvider workspace={props.workspace}>
					<WorkspaceUpdateNavHistory>{props.children}</WorkspaceUpdateNavHistory>
				</WorkspaceContextProvider>
			</UserContextProvider>
		</ThemeProvider>
	);
}
