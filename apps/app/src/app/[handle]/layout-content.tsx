import { SidebarNav } from '~/app/[handle]/_components/dash-sidebar-nav';
import { NavigationHandler } from '~/app/[handle]/_components/navigation-handler';
import { NewWorkspaceModal } from '~/app/[handle]/_components/new-workspace-modal';
import { WorkspaceProviders } from '~/app/[handle]/_components/workspace-providers';

interface LayoutContentProps {
	user: any;
	workspace: any;
	children: React.ReactNode;
}

export function LayoutContent({ user, workspace, children }: LayoutContentProps) {
	return (
		<WorkspaceProviders user={user} workspace={workspace}>
			<NavigationHandler>
				<div className='mx-auto flex w-full flex-1 flex-row'>
					<SidebarNav />
					<NewWorkspaceModal />

					<div className='flex h-[100vh] w-full flex-col bg-accent md:pt-2'>
						<div className='flex h-full w-full border-l border-t border-subtle-foreground/70 bg-background md:rounded-tl-2xl'>
							<div className='flex h-full w-full flex-col overflow-clip'>
								<div className='grid h-fit grid-cols-1 gap-6 overflow-y-scroll p-6 lg:py-8'>
									{children}
								</div>
							</div>
						</div>
					</div>
				</div>
			</NavigationHandler>
		</WorkspaceProviders>
	);
}
