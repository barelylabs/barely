import { H } from '@barely/ui/elements/typography';

import { DashContentHeader } from '~/app/[handle]/_components/dash-content-header';
import { AddMemberButton } from '~/app/[handle]/settings/team/_components/add-member-button';
import {
	AllInvites,
	AllMembers,
} from '~/app/[handle]/settings/team/_components/all-members';
import { InviteMemberModal } from '~/app/[handle]/settings/team/_components/invite-member-modal';

export default function TeamPage() {
	return (
		<>
			<DashContentHeader
				title='Members'
				subtitle='Manage your team'
				button={<AddMemberButton />}
			/>
			<H size='2'>Members</H>
			<AllMembers />
			<H size='2'>Invites</H>
			<AllInvites />
			<InviteMemberModal />
		</>
	);
}
