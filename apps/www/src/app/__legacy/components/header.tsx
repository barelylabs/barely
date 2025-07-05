'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

import { Button } from '@barely/ui/button';
import { Container } from '@barely/ui/container';
import { Icon } from '@barely/ui/icon';
import { Logo } from '@barely/ui/logo';

const Header = () => {
	const [isOpen, setIsOpen] = useState(false);

	useEffect(() => {
		const html = document.querySelector('html');
		if (html) html.classList.toggle('overflow-hidden', isOpen);
	}, [isOpen]);

	useEffect(() => {
		const handleResize = () => setIsOpen(false);
		window.addEventListener('orientationchange', handleResize);
		window.addEventListener('resize', () => handleResize);
		return () => {
			window.removeEventListener('orientationchange', handleResize);
			window.removeEventListener('resize', handleResize);
		};
	}, [setIsOpen]);

	return (
		<header className='fixed left-0 top-0 z-10 w-full border-b-[1px] backdrop-blur-[12px]'>
			<Container className='flex flex-row items-center py-3'>
				<Link href='/' className='flex items-center text-md font-extrabold md:text-2xl'>
					<Logo className='mr-2 h-[1.2rem] w-[1.2rem] md:h-[1.5rem] md:w-[1.5rem]' />
					<div className='relative'>
						<span className='font-heading'>barely</span>
						<span className='-top-5 text-xs font-normal'>.io</span>
					</div>
				</Link>
				<div className='ml-auto flex h-full items-center space-x-1 sm:space-x-6'>
					<Button href='https://app.barely.io/login' look='muted'>
						Log in
					</Button>
					<Button href='https://app.barely.io/register' pill look='secondary'>
						Sign up
					</Button>
				</div>
				<button onClick={() => setIsOpen(!isOpen)} className='ml-6 md:hidden'>
					<span className='sr-only'>Toggle menu</span>
					<Icon.menu />
				</button>
			</Container>
		</header>
	);
};

export { Header };
