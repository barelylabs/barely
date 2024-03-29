// import { MainNav } from './main-nav';
// import { MobileNav } from './mobile-nav';
import { ModeToggle } from './mode-toggle';
import { UserAccountNav } from './user-menu';

const DashboardHeader = () => {
	return (
		<header className='sticky top-0 z-40 w-full bg-background '>
			<div className='container flex h-12 items-center'>
				{/* <MainNav />
				<MobileNav /> */}
				<div className='flex flex-1 items-center justify-between space-x-2 sm:space-x-4 md:justify-end'>
					<nav className='flex items-center space-x-1'>
						<ModeToggle />
						<UserAccountNav />
					</nav>
				</div>
			</div>
		</header>
	);
};

export { DashboardHeader };
