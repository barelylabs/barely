import { getServerUser } from '@barely/auth/get-session';

import { ScrollArea } from '@barely/ui/elements/scroll-area';

import { DashboardHeader } from '~/app/(dash)/components/dash-header';
import { DashSidebarNav } from '~/app/(dash)/components/dash-sidebar-nav';
import HydrateUserAtom from '~/client/hydrate-user-atom';
import { siteConfig } from '~/config/site';

interface DashboardLayoutProps {
	children: React.ReactNode;
}

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
	const user = await getServerUser();

	return (
		<>
			{/* @ts-expect-error Server Component */}
			<DashboardHeader />
			{user && <HydrateUserAtom initialUser={user} />}
			<div className=' flex-1 w-full mx-auto max-w-7xl items-start md:grid md:grid-cols-[220px_minmax(0,1fr)] md:gap-4 lg:grid-cols-[240px_minmax(0,1fr)]'>
				<aside className='fixed top-14 z-30 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 overflow-y-auto border-r border-r-slate-100 dark:border-r-slate-700 md:sticky md:block'>
					<ScrollArea className='px-6 md:py-6 lg:py-10'>
						<DashSidebarNav user={user} items={siteConfig.sidebarNav} />
					</ScrollArea>
				</aside>
				<div className='flex flex-col flex-1 px-6 py-6 gap-6 lg:py-10'>{children}</div>
			</div>
		</>
	);
}
