import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { checkIfWorkspaceHasPendingInviteForUser } from '@barely/lib/functions/workspace.fns';

import { getDefaultWorkspaceFromSession } from '@barely/auth/utils';

import { DashboardSkeleton } from '~/app/[handle]/_components/dashboard-skeleton';
import { LayoutContent } from '~/app/[handle]/layout-content';
import { getSession } from '~/auth/server';
import { HydrateClient, prefetch, primeWorkspace, trpc } from '~/trpc/server';

async function DashboardContent({
	params,
	children,
}: {
	params: { handle: string };
	children: React.ReactElement;
}) {
	const session = await getSession();

	if (!session) return redirect('/login');

	const user = session.user;
	const userWorkspace = user.workspaces.find(w => w.type === 'personal');

	if (userWorkspace) user.avatarImageS3Key = userWorkspace.avatarImageS3Key;

	const currentWorkspace = user.workspaces.find(w => w.handle === params.handle);

	if (!currentWorkspace) {
		const addedToWorkspace = await checkIfWorkspaceHasPendingInviteForUser({
			user,
			workspaceHandle: params.handle,
		});

		if (addedToWorkspace.success) {
			return redirect('/');
		}

		const defaultWorkspace = getDefaultWorkspaceFromSession(session);
		return redirect(`${defaultWorkspace.handle}/fm`);
	}

	primeWorkspace(currentWorkspace);
	prefetch(trpc.workspace.byHandleWithAll.queryOptions({ handle: params.handle }));

	return (
		<LayoutContent user={user} workspace={currentWorkspace}>
			{children}
		</LayoutContent>
	);
}

export default async function DashboardLayout({
	params,
	children,
}: {
	params: Promise<{ handle: string }>;
	children: React.ReactElement;
}) {
	const awaitedParams = await params;

	return (
		<HydrateClient>
			<Suspense fallback={<DashboardSkeleton />}>
				<DashboardContent params={awaitedParams}>{children}</DashboardContent>
			</Suspense>
		</HydrateClient>
	);
}
