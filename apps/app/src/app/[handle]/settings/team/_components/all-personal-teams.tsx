'use client';

import type { SessionWorkspace } from '@barely/auth';
import type { ReactNode } from 'react';
import { useWorkspaceIsPersonal } from '@barely/hooks';
import { useSuspenseQuery } from '@tanstack/react-query';

import { useTRPC } from '@barely/api/app/trpc.react';

import { Button } from '@barely/ui/button';
import { GridListSkeleton } from '@barely/ui/components/grid-list-skeleton';
import { NoResultsPlaceholder } from '@barely/ui/components/no-results-placeholder';
import { GridList, GridListCard } from '@barely/ui/grid-list';
import { H } from '@barely/ui/typography';

import { usePersonalInvitesContext } from '~/app/[handle]/settings/team/_components/personal-invites-context';

export function AllMyWorkspaces() {
	const trpc = useTRPC();
	const { data: workspaces, isFetching } = useSuspenseQuery(
		trpc.user.workspaces.queryOptions(),
	);

	const isPersonal = useWorkspaceIsPersonal();

	if (!isPersonal) return null;

	return (
		<>
			<H size='5'>My Teams</H>
			<p className='text-sm text-muted-foreground'>
				These are the workspaces you belong to.
			</p>
			<GridList
				items={workspaces.filter(w => w.type !== 'personal')}
				renderEmptyState={() =>
					isFetching ?
						<GridListSkeleton count={2} />
					:	<NoResultsPlaceholder icon='workspace' title='No workspaces found.' />
				}
			>
				{workspace => <WorkspaceCard key={workspace.id} workspace={workspace} />}
			</GridList>
		</>
	);
}

export function AllMyInvites() {
	const isPersonal = useWorkspaceIsPersonal();
	// const { data: invites, isFetching } = api.user.workspaceInvites.useQuery(undefined, {
	// 	enabled: isPersonal,
	// });

	const { invites, isFetching, setAcceptInviteWorkspaceId, setShowAcceptInviteModal } =
		usePersonalInvitesContext();
	if (!isPersonal) return null;

	return (
		<div className='flex flex-col gap-4'>
			<H size='5'>Invites</H>
			<p className='text-sm text-muted-foreground'>
				These are the workspace invites you have received.
			</p>
			<GridList
				items={invites.map(invite => ({
					...invite,
					id: invite.workspace.id,
					workspace: { ...invite.workspace, role: invite.role },
				}))}
				renderEmptyState={() =>
					isFetching ?
						<GridListSkeleton count={1} />
					:	<p className='text-md text-muted-foreground'>🫥 ...no invites right now. 🫥</p>
				}
			>
				{invite => (
					<WorkspaceCard key={invite.id} workspace={invite.workspace}>
						<div className='flex w-full justify-end'>
							<Button
								onClick={() => {
									setAcceptInviteWorkspaceId(invite.id);
									setShowAcceptInviteModal(true);
								}}
							>
								Join
							</Button>
						</div>
					</WorkspaceCard>
				)}
			</GridList>
		</div>
	);
}

function WorkspaceCard({
	workspace,
	children,
}: {
	workspace: Pick<SessionWorkspace, 'id' | 'name' | 'handle' | 'role'>;
	children?: ReactNode;
}) {
	return (
		<GridListCard
			title={workspace.name}
			subtitle={workspace.handle}
			description={workspace.role}
		>
			{children}
		</GridListCard>
	);
}
