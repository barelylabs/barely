'use client';

import type { SessionUser, SessionWorkspace } from '@barely/server/auth';
import type { ReactNode } from 'react';
import { WorkspaceContext } from '@barely/lib/context/workspace.context';
import { useWorkspaceHotkeys } from '@barely/lib/hooks/use-workspace-hotkeys';

import { useUpdateNavHistory } from '@barely/hooks/use-nav-history';
import { UserContext } from '@barely/hooks/use-user';

import { ThemeProvider } from '@barely/ui/elements/next-theme-provider';

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
}

export function WorkspaceContextProvider({
	workspace,
	children,
}: WorkspaceContextProviderProps) {
	useWorkspaceHotkeys({ workspace });

	return (
		<WorkspaceContext.Provider value={workspace}>{children}</WorkspaceContext.Provider>
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
