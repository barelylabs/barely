'use client';

import { useState } from 'react';
import Link from 'next/link';
import { getAbsoluteUrl } from '@barely/utils';
import { Menu, X } from 'lucide-react';

import { Button } from '@barely/ui/button';
import { Icon } from '@barely/ui/icon';

export function Navbar() {
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

	return (
		<header className='fixed top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md'>
			<nav className='container mx-auto px-4 sm:px-6 lg:px-8'>
				<div className='flex h-16 items-center justify-between'>
					{/* Logo */}
					<Link href='/' className='flex items-center gap-2'>
						<Icon.receipt className='h-6 w-6 text-primary' />
						<span className='font-heading text-xl font-semibold'>Barely Invoice</span>
					</Link>

					{/* Desktop Navigation */}
					<div className='hidden items-center gap-8 md:flex'>
						<Link
							href='#pricing'
							className='text-sm font-medium text-muted-foreground hover:text-foreground'
						>
							Pricing
						</Link>
						<Link
							href={'#waitlist'}
							className='text-sm font-medium text-muted-foreground hover:text-foreground'
						>
							Sign In
						</Link>
						<Button size='sm' look='brand' href='#waitlist'>
							Start Free →
						</Button>
					</div>

					{/* Mobile menu button */}
					<button
						className='md:hidden'
						onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
						aria-label='Toggle menu'
					>
						{mobileMenuOpen ?
							<X className='h-6 w-6' />
						:	<Menu className='h-6 w-6' />}
					</button>
				</div>

				{/* Mobile Navigation */}
				{mobileMenuOpen && (
					<div className='absolute left-0 right-0 top-16 border-b bg-background p-4 md:hidden'>
						<div className='flex flex-col gap-4'>
							<Link
								href='#pricing'
								className='text-sm font-medium text-muted-foreground hover:text-foreground'
								onClick={() => setMobileMenuOpen(false)}
							>
								Pricing
							</Link>
							<Link
								href={getAbsoluteUrl('app')}
								className='text-sm font-medium text-muted-foreground hover:text-foreground'
								onClick={() => setMobileMenuOpen(false)}
							>
								Sign In
							</Link>
							<Button size='sm' look='brand' href='#waitlist' className='w-full'>
								Start Free →
							</Button>
						</div>
					</div>
				)}
			</nav>
		</header>
	);
}
