import { DashContentHeader } from '~/app/[handle]/_components/dash-content-header';
import {
	DisplayOrWorkspaceNameForm,
	HandleForm,
	WorkspaceAvatarForm,
	WorkspaceBioForm,
	WorkspaceHeaderForm,
	WorkspaceTypeForm,
} from '~/app/[handle]/settings/workspace-profile-settings';

export default function WorkspaceProfileSettingsPage() {
	return (
		<>
			<DashContentHeader title='Profile' subtitle='Update your workspace profile.' />
			<DisplayOrWorkspaceNameForm />
			<HandleForm />
			<WorkspaceAvatarForm />
			<WorkspaceHeaderForm />
			<WorkspaceTypeForm />
			<WorkspaceBioForm />
		</>
	);
}
