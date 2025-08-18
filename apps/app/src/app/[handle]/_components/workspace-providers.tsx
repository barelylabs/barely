'use client';

import type { SessionUser, SessionWorkspace } from '@barely/auth';
import type { ReactNode } from 'react';
import { UserContext, useUpdateNavHistory, useWorkspaceHotkeys } from '@barely/hooks';
import { defaultBrandKit } from '@barely/validators';
import { useHydrateAtoms } from 'jotai/utils';

import { workspaceAtom } from '@barely/atoms/workspace';

import { BrandKitProvider } from '@barely/ui/bio';
import { ThemeProvider } from '@barely/ui/next-theme-provider';

interface UserContextProviderProps {
	user: SessionUser;
	children: ReactNode;
}

export const UserContextProvider = (props: UserContextProviderProps) => {
	return <UserContext.Provider value={props.user}>{props.children}</UserContext.Provider>;
};

interface WorkspaceContextProviderProps {
	workspace: SessionWorkspace;
	children: ReactNode;
}

export function WorkspaceContextProvider({
	workspace,
	children,
}: WorkspaceContextProviderProps) {
	useWorkspaceHotkeys({ workspace });

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
		<BrandKitProvider brandKit={props.workspace.brandKit ?? defaultBrandKit}>
			<ThemeProvider attribute='class' defaultTheme='system' enableSystem>
				<UserContextProvider user={props.user}>
					<WorkspaceContextProvider workspace={props.workspace}>
						<WorkspaceUpdateNavHistory>{props.children}</WorkspaceUpdateNavHistory>
					</WorkspaceContextProvider>
				</UserContextProvider>
			</ThemeProvider>
		</BrandKitProvider>
	);
}
