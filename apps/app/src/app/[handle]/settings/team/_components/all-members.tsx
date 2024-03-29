'use client';

import { useWorkspace } from '@barely/lib/hooks/use-workspace';
import { api } from '@barely/lib/server/api/react';

export function AllMembers() {
	const workspace = useWorkspace();
	const { data: members } = api.workspace.members.useQuery({
		handle: workspace.handle,
	});

	return (
		<div>
			{members?.map(member => (
				<div key={member.id} className='border border-border p-4'>
					<h2>{member.fullName ?? member.handle}</h2>
					<p>{member.email}</p>
				</div>
			))}
		</div>
	);
}

export function AllInvites() {
	const workspace = useWorkspace();
	const { data: invites } = api.workspace.invites.useQuery({
		handle: workspace.handle,
	});

	return (
		<div>
			{invites?.map(invite => (
				<div key={invite.email} className='border border-border p-4'>
					<h2>{invite.email}</h2>
					<p>{invite.role}</p>
				</div>
			))}
		</div>
	);
}
