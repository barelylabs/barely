import { redirect } from 'next/navigation';
import { getDefaultWorkspaceOfCurrentUser } from '@barely/lib/server/auth/auth.fns';
import { checkIfWorkspaceHasPendingInviteForUser } from '@barely/lib/server/routes/workspace/workspace.fns';
import { auth } from '@barely/server/auth';

import { SidebarNav } from '~/app/[handle]/_components/dash-sidebar-nav';
import { NewWorkspaceModal } from '~/app/[handle]/_components/new-workspace-modal';
import { WorkspaceProviders } from '~/app/[handle]/_components/providers';
import { DashboardHeader } from './_components/dash-header';

export default async function DashboardLayout({
	params,
	children,
}: {
	params: { handle: string };
	children: React.ReactElement;
}) {
	const session = await auth();

	if (!session) return redirect('/login');

	const user = session.user;
	const userWorkspace = user.workspaces.find(w => w.type === 'personal');
	if (userWorkspace) user.image = userWorkspace.imageUrl;

	const currentWorkspace = user.workspaces.find(w => w.handle === params.handle);

	if (!currentWorkspace) {
		const addedToWorkspace = await checkIfWorkspaceHasPendingInviteForUser({
			user,
			workspaceHandle: params.handle,
		});

		if (addedToWorkspace.success) {
			return redirect('/');
		}

		const defaultWorkspace = await getDefaultWorkspaceOfCurrentUser();
		return redirect(`${defaultWorkspace.handle}/links`);
	}

	return (
		<WorkspaceProviders user={user} workspace={currentWorkspace}>
			<div className='mx-auto flex  w-full flex-1 flex-row'>
				<SidebarNav workspace={currentWorkspace} />
				<NewWorkspaceModal />
				<div className='flex h-[100vh] w-full flex-col'>
					<DashboardHeader />
					<div className='flex h-full w-full flex-col overflow-clip  p-6 lg:py-8'>
						<div className='grid h-fit grid-cols-1 gap-6 overflow-y-scroll'>
							{children}
						</div>
					</div>
				</div>
			</div>
		</WorkspaceProviders>
	);
}
