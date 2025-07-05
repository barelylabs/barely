'use client';

import type { AppRouterOutputs } from '@barely/api/app/app.router';
import { createContext, useContext, useState } from 'react';
import { useWorkspace } from '@barely/hooks';
import { useQuery } from '@tanstack/react-query';

import { useTRPC } from '@barely/api/app/trpc.react';

interface PersonalInvitesContext {
	invites: AppRouterOutputs['user']['workspaceInvites'];
	acceptInviteWorkspaceId: string | null;
	acceptInviteWorkspaceName: string | null;
	setAcceptInviteWorkspaceId: (workspaceId: string | null) => void;
	showAcceptInviteModal: boolean;
	setShowAcceptInviteModal: (show: boolean) => void;
	isFetching: boolean;
}

const PersonalInvitesContext = createContext<PersonalInvitesContext | undefined>(
	undefined,
);

export function PersonalInvitesContextProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	const [showAcceptInviteModal, setShowAcceptInviteModal] = useState(false);
	const [acceptInviteWorkspaceId, setAcceptInviteWorkspaceId] = useState<string | null>(
		null,
	);
	const trpc = useTRPC();
	const { isPersonal } = useWorkspace();

	const { data: invites, isFetching } = useQuery({
		...trpc.user.workspaceInvites.queryOptions(undefined),
		enabled: isPersonal,
	});

	const acceptInviteWorkspaceName =
		invites?.find(invite => invite.workspaceId === acceptInviteWorkspaceId)?.workspace
			.name ?? null;

	const contextValue = {
		invites: invites ?? [],

		acceptInviteWorkspaceId,
		acceptInviteWorkspaceName,
		setAcceptInviteWorkspaceId,

		showAcceptInviteModal,
		setShowAcceptInviteModal,

		isFetching,
	} satisfies PersonalInvitesContext;

	return (
		<PersonalInvitesContext.Provider value={contextValue}>
			{children}
		</PersonalInvitesContext.Provider>
	);
}

export function usePersonalInvitesContext() {
	const context = useContext(PersonalInvitesContext);
	if (!context) {
		throw new Error(
			'usePersonalInvitesContext must be used within a PersonalInvitesContextProvider',
		);
	}
	return context;
}
