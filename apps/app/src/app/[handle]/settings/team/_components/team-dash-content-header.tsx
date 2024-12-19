'use client';

import { useWorkspaceIsPersonal } from '@barely/lib/hooks/use-workspace';

import { DashContentHeader } from '~/app/[handle]/_components/dash-content-header';
import { AddMemberButton } from '~/app/[handle]/settings/team/_components/add-member-button';

export function TeamDashContentHeader() {
	const isPersonal = useWorkspaceIsPersonal();

	return (
		<DashContentHeader
			title={isPersonal ? 'My Teams' : 'Team'}
			subtitle={
				isPersonal ? 'Manage the teams you are a member of' : 'Manage your team members'
			}
			button={<AddMemberButton />}
		/>
	);
}
