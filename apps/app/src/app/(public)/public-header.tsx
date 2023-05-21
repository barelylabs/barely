import Image from 'next/image';

const PublicHeader = () => {
	return (
		<header className='sticky top-0 z-40 w-full  border-b border-b-slate-200 bg-white dark:border-b-slate-700 dark:bg-slate-900'>
			<div className='container flex h-16 items-center max-w-5xl'>
				<PublicMainNav />
				{/* <MobileNav /> */}
				<div className='flex flex-1 items-center justify-between space-x-2 sm:space-x-4 md:justify-end'>
					<nav className='flex items-center space-x-1'></nav>
				</div>
			</div>
		</header>
	);
};

const PublicMainNav = () => {
	return (
		<div className='hidden md:flex'>
			<Image
				src='/static/logo+barely-io__transparent+light_txt.png'
				alt='barely.io logo'
				width={120}
				height={120}
			/>
			{/* <span className='hidden font-bold sm:inline-block'>{siteConfig.name}</span> */}
		</div>
	);
};

export { PublicHeader };
