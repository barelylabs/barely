import { redirect } from 'next/navigation';
import { checkIfWorkspaceHasPendingInviteForUser } from '@barely/lib/functions/workspace.fns';

import { getDefaultWorkspaceFromSession } from '@barely/auth/utils';

import { SidebarNav } from '~/app/[handle]/_components/dash-sidebar-nav';
import { NewWorkspaceModal } from '~/app/[handle]/_components/new-workspace-modal';
import { WorkspaceProviders } from '~/app/[handle]/_components/workspace-providers';
import { getSession } from '~/auth/server';
import { HydrateClient, prefetch, primeWorkspace, trpc } from '~/trpc/server';

export default async function DashboardLayout({
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
	const currentWorkspace = user.workspaces.find(w => w.handle === awaitedParams.handle);

	if (!currentWorkspace) {
		const addedToWorkspace = await checkIfWorkspaceHasPendingInviteForUser({
			user,
			workspaceHandle: awaitedParams.handle,
		});

		if (addedToWorkspace.success) {
			return redirect('/');
		}

		const defaultWorkspace = getDefaultWorkspaceFromSession(session);
		return redirect(`${defaultWorkspace.handle}/fm`);
	}

	primeWorkspace(currentWorkspace);
	prefetch(trpc.workspace.byHandleWithAll.queryOptions({ handle: awaitedParams.handle }));

	return (
		<HydrateClient>
			<WorkspaceProviders user={user} workspace={currentWorkspace}>
				<div className='mx-auto flex w-full flex-1 flex-row'>
					<SidebarNav />
					<NewWorkspaceModal />

					<div className='flex h-[100vh] w-full flex-col bg-accent md:pt-2'>
						{/* <DashboardHeader /> */}
						<div className='flex h-full w-full border-l border-t border-subtle-foreground/70 bg-background md:rounded-tl-2xl'>
							<div className='flex h-full w-full flex-col overflow-clip'>
								<div className='grid h-fit grid-cols-1 gap-6 overflow-y-scroll p-6 lg:py-8'>
									{children}
								</div>
							</div>
						</div>
					</div>
				</div>
			</WorkspaceProviders>
		</HydrateClient>
	);
}
