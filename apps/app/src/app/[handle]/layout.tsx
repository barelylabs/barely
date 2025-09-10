import { redirect } from 'next/navigation';
import { checkIfWorkspaceHasPendingInviteForUser } from '@barely/lib/functions/workspace.fns';

import { getDefaultWorkspaceFromSession } from '@barely/auth/utils';

import { DashboardLayout } from '~/app/[handle]/_components/dashboard-layout';
import { NewWorkspaceModal } from '~/app/[handle]/_components/new-workspace-modal';
import { WorkspaceProviders } from '~/app/[handle]/_components/workspace-providers';
import { getSession } from '~/auth/server';
import { HydrateClient, prefetch, primeWorkspace, trpc } from '~/trpc/server';

export default async function HandleLayout({
	params,
	children,
}: {
	params: Promise<{ handle: string }>;
	children: React.ReactElement;
}) {
	const session = await getSession();

	if (!session) return redirect('/login');

	const user = session.user;
	const userWorkspace = user.workspaces.find(w => w.type === 'personal');

	if (userWorkspace) user.avatarImageS3Key = userWorkspace.avatarImageS3Key;

	const awaitedParams = await params;
	const currentWorkspace = user.workspaces.find(w =>
		awaitedParams.handle === 'account' ?
			w.type === 'personal'
		:	w.handle === awaitedParams.handle,
	);

	if (!currentWorkspace) {
		const addedToWorkspace = await checkIfWorkspaceHasPendingInviteForUser({
			user,
			workspaceHandle: awaitedParams.handle,
		});

		if (addedToWorkspace.success) {
			return redirect('/');
		}

		const defaultWorkspace = getDefaultWorkspaceFromSession(session);

		if (!defaultWorkspace) {
			return redirect('/onboarding');
		}

		return redirect(`${defaultWorkspace.handle}/bio`);
	}

	primeWorkspace(currentWorkspace);
	prefetch(trpc.workspace.byHandleWithAll.queryOptions({ handle: awaitedParams.handle }));

	return (
		<HydrateClient>
			<WorkspaceProviders user={user} workspace={currentWorkspace}>
				<div className='mx-auto flex w-full flex-1 flex-row'>
					<NewWorkspaceModal />
					<DashboardLayout>{children}</DashboardLayout>
				</div>
			</WorkspaceProviders>
		</HydrateClient>
	);
}
