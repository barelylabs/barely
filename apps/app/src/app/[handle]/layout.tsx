import { redirect } from 'next/navigation';
import { checkIfWorkspaceHasPendingInviteForUser } from '@barely/lib/functions/workspace.fns';

import { DashboardLayout } from '~/app/[handle]/_components/dashboard-layout';
import { NewWorkspaceModal } from '~/app/[handle]/_components/new-workspace-modal';
import { WorkspaceProviders } from '~/app/[handle]/_components/workspace-providers';
import { getSession } from '~/auth/server';
import { HydrateClient, prefetch, primeWorkspace, trpc, trpcCaller } from '~/trpc/server';

export default async function HandleLayout({
	params,
	children,
}: {
	params: Promise<{ handle: string }>;
	children: React.ReactElement;
}) {
	const session = await getSession();

	if (!session) return redirect('/login');

	// Fetch enriched user via tRPC (includes workspaces and profile data)
	const user = await trpcCaller.user.me();
	const userWorkspaces = user.workspaces;

	const awaitedParams = await params;
	const currentWorkspace = userWorkspaces.find(w =>
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

		// Get default workspace (prefer non-personal workspace)
		const defaultWorkspace = userWorkspaces.find(w => w.type !== 'personal') ?? null;

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
