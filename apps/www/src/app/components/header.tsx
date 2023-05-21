'use client';

import { useEffect, useState } from 'react';

import Link from 'next/link';

import { Button } from '@barely/ui/elements/button';
import { Container } from '@barely/ui/elements/container';
import { Icon } from '@barely/ui/elements/icon';
import { Logo } from '@barely/ui/elements/logo';

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
		<header className='fixed top-0 left-0 z-10 w-full border-b-[1px] backdrop-blur-[12px]'>
			<Container className='flex flex-row py-3 items-center'>
				<Link href='/' className='flex items-center text-md md:text-2xl font-extrabold'>
					<Logo className='mr-2 h-[1.2rem] w-[1.2rem] md:h-[1.5rem] md:w-[1.5rem]' />
					<div className='relative'>
						<span>barely</span>
						<span className='text-xs font-light -top-5'>.io</span>
					</div>
				</Link>
				<div className='ml-auto flex h-full items-center'>
					<Button href='https://app.barely.io/login' className='mr-6' variant='subtle'>
						Log in
					</Button>
					<Button href='https://app.barely.io/register' pill variant='secondary'>
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
