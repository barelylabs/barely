import { getServerUser } from '@barely/auth/get-session';

import { UserAccountNav } from '~/app/(dash)/components/user-menu';

import { MainNav } from './main-nav';
import { MobileNav } from './mobile-nav';
import { ModeToggle } from './mode-toggle';

const DashboardHeader = async () => {
	const user = await getServerUser();

	return (
		<header className='sticky top-0 z-40 w-full  border-b border-b-slate-200 bg-white dark:border-b-slate-700 dark:bg-slate-900'>
			<div className='container flex h-16 items-center max-w-7xl'>
				<MainNav />
				<MobileNav />
				<div className='flex flex-1 items-center justify-between space-x-2 sm:space-x-4 md:justify-end'>
					<nav className='flex items-center space-x-1'>
						{/* <Link href={siteConfig.links.github} target='_blank' rel='noreferrer'>
							<div
								className={buttonVariants({
									size: 'sm',
									variant: 'ghost',
									className: 'text-slate-700 dark:text-slate-400',
								})}
							>
								<Icon.gitHub className='h-5 w-5' />
								<span className='sr-only'>GitHub</span>
							</div>
						</Link>
						<Link href={siteConfig.links.twitter} target='_blank' rel='noreferrer'>
							<div
								className={buttonVariants({
									size: 'sm',
									variant: 'ghost',
									className: 'text-slate-700 dark:text-slate-400',
								})}
							>
								<Icon.twitter className='h-5 w-5 fill-current' />
								<span className='sr-only'>Twitter</span>
							</div>
						</Link> */}
						<ModeToggle />
						{user && <UserAccountNav user={user} />}
					</nav>
				</div>
			</div>
		</header>
	);
};

export { DashboardHeader };
