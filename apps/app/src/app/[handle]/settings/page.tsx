import { DashContent } from '~/app/[handle]/_components/dash-content';
import { DashContentHeader } from '~/app/[handle]/_components/dash-content-header';
import {
	DisplayOrWorkspaceNameForm,
	HandleForm,
	WorkspaceAvatarForm,
	WorkspaceBioForm,
	WorkspaceBrandHuesForm,
	WorkspaceHeaderForm,
	WorkspaceTypeForm,
} from '~/app/[handle]/settings/workspace-profile-settings';
import { HydrateClient, prefetch, trpc } from '~/trpc/server';

export default async function WorkspaceProfileSettingsPage({
	params,
}: {
	params: Promise<{ handle: string }>;
}) {
	const { handle } = await params;

	prefetch(trpc.workspace.byHandleWithAll.queryOptions({ handle }));

	return (
		<HydrateClient>
			<DashContentHeader title='Profile' subtitle='Update your workspace profile.' />
			<DashContent>
				<DisplayOrWorkspaceNameForm />
				<HandleForm />
				<WorkspaceAvatarForm />
				<WorkspaceHeaderForm />
				<WorkspaceTypeForm />
				<WorkspaceBioForm />
				<WorkspaceBrandHuesForm />
			</DashContent>
		</HydrateClient>
	);
}
