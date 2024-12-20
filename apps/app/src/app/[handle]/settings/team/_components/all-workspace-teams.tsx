'use client';

import type { AppRouterOutputs } from '@barely/lib/server/api/react';
import type { SessionWorkspaceInvite } from '@barely/lib/server/routes/workspace-invite/workspace-invite.schema';
import { useEffect } from 'react';
import { useWorkspace, useWorkspaceIsPersonal } from '@barely/lib/hooks/use-workspace';
import { api } from '@barely/lib/server/api/react';

import { GridListSkeleton } from '@barely/ui/components/grid-list-skeleton';
import { NoResultsPlaceholder } from '@barely/ui/components/no-results-placeholder';
import { GridList, GridListCard } from '@barely/ui/elements/grid-list';
import { H } from '@barely/ui/elements/typography';

import { AddMemberButton } from '~/app/[handle]/settings/team/_components/add-member-button';

export function AllWorkspaceMembers() {
	const { handle, isPersonal } = useWorkspace();
	const { data: members, isFetching } = api.workspace.members.useQuery({
		handle,
	});

	useEffect(() => {
		console.log('handle for members => ', handle);
	}, [handle]);

	if (isPersonal) return null;

	return (
		<div className='flex flex-col gap-4'>
			<H size='5'>Members</H>
			<p className='text-sm text-muted-foreground'>
				These are the members of your workspace.
			</p>
			<GridList
				items={members}
				aria-label='Team members'
				renderEmptyState={() =>
					isFetching ?
						<GridListSkeleton count={2} />
					:	<NoResultsPlaceholder
							icon='users'
							title='No team members found.'
							subtitle='Invite team members to your workspace.'
							button={<AddMemberButton />}
						/>
				}
			>
				{member => <MemberCard member={member} />}
			</GridList>
		</div>
	);
}

function MemberCard({
	member,
}: {
	member: AppRouterOutputs['workspace']['members'][number];
}) {
	return (
		<GridListCard
			textValue={member.fullName ?? member.handle ?? member.email}
			title={member.fullName ?? member.handle ?? member.email}
			subtitle={member.email}
		/>
	);
}

export function AllWorkspaceInvites() {
	const { handle } = useWorkspace();
	const isPersonal = useWorkspaceIsPersonal();

	const { data: invites, isFetching } = api.workspace.invites.useQuery(
		{ handle },
		{
			enabled: !isPersonal,
		},
	);

	if (isPersonal) return null;

	return (
		<div className='flex flex-col gap-4'>
			<H size='5'>Invites</H>
			<p className='text-sm text-muted-foreground'>
				These are the outstanding invites to your workspace.
			</p>
			<GridList
				aria-label='Team invites'
				items={
					invites?.map(invite => ({
						...invite,
						id: invite.email,
						role: invite.role === 'owner' ? 'admin' : invite.role,
					})) ?? []
				}
				renderEmptyState={() =>
					isFetching ?
						<GridListSkeleton count={2} />
					:	<NoResultsPlaceholder
							icon='workspace'
							title='No invites found.'
							subtitle='Invite team members to your workspace.'
							button={<AddMemberButton />}
						/>
				}
			>
				{invite => <InviteCard invite={invite} />}
			</GridList>
		</div>
	);
}

function InviteCard({
	invite,
}: {
	invite: Pick<SessionWorkspaceInvite, 'email' | 'role' | 'expiresAt'>;
}) {
	return (
		<GridListCard
			textValue={invite.email}
			title={invite.email}
			subtitle={invite.role}
			description={`Expires ${invite.expiresAt.toLocaleDateString()}`}
		/>
	);
}