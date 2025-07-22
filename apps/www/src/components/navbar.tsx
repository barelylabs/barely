'use client';

import { useState } from 'react';
import { getAbsoluteUrl } from '@barely/utils';
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react';
import { Bars2Icon } from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';

import { ContactModal } from './contact-modal';
import { Link } from './link';
import { Logo } from './logo';
import { MarketingButton } from './marketing-button';
import { PlusGrid, PlusGridItem, PlusGridRow } from './plus-grid';

const links = [
	{ href: '/features', label: 'Features' },
	{ href: '/pricing', label: 'Pricing' },
	{ href: '/company', label: 'Company' },
	// { href: '/blog', label: 'Blog' },
	{ href: getAbsoluteUrl('app', '/login'), label: 'Login' },
];

function DesktopNav({ onDemoClick }: { onDemoClick: () => void }) {
	return (
		<nav className='relative hidden lg:flex'>
			{links.map(({ href, label }) => (
				<PlusGridItem key={href} className='relative flex'>
					<Link
						href={href}
						className='flex items-center px-4 py-3 text-base font-medium text-white bg-blend-multiply data-[hover]:bg-white/10 hover:text-gray-300'
						{...(label === 'Login' ?
							{ target: '_blank', rel: 'noopener noreferrer' }
						:	{})}
						prefetch={true}
					>
						{label}
					</Link>
				</PlusGridItem>
			))}
			<PlusGridItem className='relative flex items-center'>
				<MarketingButton
					variant='glass'
					onClick={onDemoClick}
					className='mx-3 h-9 px-4 text-sm'
				>
					Book Demo
				</MarketingButton>
			</PlusGridItem>
		</nav>
	);
}

function MobileNavButton() {
	return (
		<DisclosureButton
			className='flex size-12 items-center justify-center self-center rounded-lg data-[hover]:bg-white/10 lg:hidden'
			aria-label='Open main menu'
		>
			<Bars2Icon className='size-6 text-white' />
		</DisclosureButton>
	);
}

function MobileNav() {
	return (
		<DisclosurePanel className='lg:hidden'>
			<div className='mx-auto max-w-2xl px-6 lg:max-w-7xl lg:px-8'>
				<div className='flex flex-col gap-6 py-4'>
					{links.map(({ href, label }, linkIndex) => (
						<motion.div
							initial={{ opacity: 0, rotateX: -90 }}
							animate={{ opacity: 1, rotateX: 0 }}
							transition={{
								duration: 0.15,
								ease: 'easeInOut',
								rotateX: { duration: 0.3, delay: linkIndex * 0.1 },
							}}
							key={href}
						>
							<Link
								href={href}
								className='text-base font-medium text-white hover:text-gray-300'
								{...(label === 'Login' ?
									{ target: '_blank', rel: 'noopener noreferrer' }
								:	{})}
								prefetch={true}
							>
								{label}
							</Link>
						</motion.div>
					))}
				</div>
			</div>
			<div className='border-t border-white/10' />
		</DisclosurePanel>
	);
}

export function Navbar({ banner }: { banner?: React.ReactNode }) {
	const [showContactModal, setShowContactModal] = useState(false);

	return (
		<>
			<Disclosure
				as='header'
				className='fixed inset-x-0 top-0 z-50 border-b border-white/10'
			>
				{/* Glassmorphism background */}
				<div className='absolute inset-0 bg-black/40 backdrop-blur-xl' />

				<div className='relative'>
					<PlusGrid>
						<PlusGridRow className='relative'>
							<div className='mx-auto flex w-full max-w-2xl justify-between px-6 lg:max-w-7xl lg:px-8'>
								<div className='relative flex gap-6'>
									<PlusGridItem className='py-3'>
										<Link prefetch={true} href='/' title='Home'>
											<Logo />
										</Link>
									</PlusGridItem>
									{banner && (
										<div className='relative hidden items-center py-3 lg:flex'>
											{banner}
										</div>
									)}
								</div>
								<DesktopNav onDemoClick={() => setShowContactModal(true)} />
								<MobileNavButton />
							</div>
						</PlusGridRow>
					</PlusGrid>
					<MobileNav />
				</div>
			</Disclosure>

			{/* Contact Modal */}
			<ContactModal
				show={showContactModal}
				onClose={() => setShowContactModal(false)}
				variant='demo'
			/>
		</>
	);
}
