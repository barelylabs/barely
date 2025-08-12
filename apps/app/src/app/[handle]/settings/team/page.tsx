import { DashContent } from '~/app/[handle]/_components/dash-content';
import { AcceptInviteModal } from '~/app/[handle]/settings/team/_components/accept-invite-modal';
import {
	AllMyInvites,
	AllMyWorkspaces,
} from '~/app/[handle]/settings/team/_components/all-personal-teams';
import {
	AllWorkspaceInvites,
	AllWorkspaceMembers,
} from '~/app/[handle]/settings/team/_components/all-workspace-teams';
import { InviteMemberModal } from '~/app/[handle]/settings/team/_components/invite-member-modal';
import { PersonalInvitesContextProvider } from '~/app/[handle]/settings/team/_components/personal-invites-context';
import { TeamDashContentHeader } from '~/app/[handle]/settings/team/_components/team-dash-content-header';

export default function TeamPage() {
	return (
		<>
			<TeamDashContentHeader />
			<DashContent>
				<AllMyWorkspaces />

				<PersonalInvitesContextProvider>
					<AllMyInvites />
					<AcceptInviteModal />
				</PersonalInvitesContextProvider>

				<AllWorkspaceMembers />
				<AllWorkspaceInvites />
				<InviteMemberModal />
			</DashContent>
		</>
	);
}
