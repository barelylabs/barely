'use client';

import type { Product } from '@barely/utils';
import { Fragment, useMemo } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useUser, useWorkspace, useWorkspaces } from '@barely/hooks';
import { cn, getProductsForVariant } from '@barely/utils';

import { Avatar } from '@barely/ui/avatar';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@barely/ui/dropdown-menu';
import { Icon } from '@barely/ui/icon';
import { Logo } from '@barely/ui/logo';
import { useTheme } from '@barely/ui/next-theme-provider';
import { Tooltip } from '@barely/ui/tooltip';
import { Text } from '@barely/ui/typography';

import { authClient } from '~/auth/client';
import { WorkspaceSwitcher } from './workspace-switcher';

export function ProductSidebar() {
	const pathname = usePathname();
	const { handle, isPersonal } = useWorkspace();
	const user = useUser();
	const allWorkspaces = useWorkspaces();
	const router = useRouter();
	const { theme, setTheme } = useTheme();

	// Find user's personal workspace
	const personalWorkspace = allWorkspaces.find(
		workspace => workspace.type === 'personal',
	);

	// Get available products based on current app variant
	const { core, meta, locked } = useMemo(() => {
		const products = getProductsForVariant();

		// Extract invoice from core products and add to meta section
		const invoiceProduct = products.core.find(p => p.id === 'invoices');
		const coreWithoutInvoice = products.core.filter(p => p.id !== 'invoices');

		// Place invoice at the beginning of meta products (above merch)
		const metaWithInvoice =
			invoiceProduct ? [invoiceProduct, ...products.meta] : products.meta;

		return {
			core: coreWithoutInvoice,
			meta: metaWithInvoice,
			locked: products.locked,
		};
	}, []);

	// Determine active product based on current pathname
	const activeProductId = useMemo(() => {
		const path = pathname.replace(`/${handle}`, '');

		// Check each product's routes
		const allProducts = [...core, ...meta];
		for (const product of allProducts) {
			if (product.routes.some(route => path.startsWith(route.path))) {
				return product.id;
			}
		}

		// Default to first available product
		return core[0]?.id ?? 'fm';
	}, [pathname, handle, core, meta]);

	const renderProduct = (product: Product, isLocked = false) => {
		const isActive = product.id === activeProductId;
		// Get the icon component - default to integrations if not found
		const iconKey = product.icon as keyof typeof Icon;
		const IconComponent = (
			iconKey in Icon ?
				Icon[iconKey]
			:	Icon.integrations) as React.ComponentType<{ className?: string }>;

		const productElement = (
			<Link
				href={isLocked ? '#' : `/${handle}${product.defaultRoute}`}
				className={cn(
					'group relative flex h-11 items-center justify-center rounded-lg transition-all duration-150',
					'outline-none focus-visible:ring-2 focus-visible:ring-black/20',
					'w-11', // Always icon-only
					isActive ? 'bg-background/80'
					: !isLocked ? 'active:bg-border hover:bg-subtle-foreground/50'
					: 'cursor-not-allowed opacity-40',
				)}
				onClick={e => {
					if (isLocked) {
						e.preventDefault();
						// TODO: Show upgrade modal
					}
				}}
			>
				<div className='relative flex-shrink-0'>
					<IconComponent className={cn('h-5 w-5 transition-colors')} />
					{isLocked && (
						<Icon.lock className='absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-white text-neutral-400' />
					)}
				</div>
				{/* Text labels removed - icon-only design */}
			</Link>
		);

		// Always show tooltips in the new design
		const tooltipContent = (
			<div className='flex min-w-[200px] flex-col gap-2 bg-primary p-3'>
				<div>
					<Text variant='sm/bold' className='text-primary-foreground'>
						{product.name}
					</Text>
					{product.description && (
						<Text variant='xs/normal' className='mt-1 text-subtle-foreground'>
							{product.description}
						</Text>
					)}
				</div>
				{isLocked && (
					<Text variant='xs/medium' className='text-warning'>
						Upgrade to unlock
					</Text>
				)}
			</div>
		);

		return (
			<Tooltip key={product.id} content={tooltipContent} side='right' delayDuration={300}>
				{productElement}
			</Tooltip>
		);
	};

	return (
		<aside
			className={cn(
				'fixed left-0 top-0 mx-auto flex h-screen flex-col items-center bg-accent',
				'w-16', // Always 64px (4rem = 64px)
				'z-30',
			)}
		>
			<Link href={`/`}>
				<Logo className='mb-3 mt-5 h-7 w-7' />
			</Link>

			{/* Workspace Switcher */}
			{!isPersonal ?
				<div className='flex items-center justify-center p-3'>
					<WorkspaceSwitcher collapsed={true} />
				</div>
			:	<div className='flex-1' />}

			{/* Core Products */}
			{!isPersonal && (
				<div className='flex-1 overflow-y-auto'>
					<div className='space-y-1 p-3'>
						{core.map(product => (
							<Fragment key={product.id}>{renderProduct(product)}</Fragment>
						))}
					</div>

					{/* Separator */}
					<div className='mx-3'>
						<div className='h-px bg-neutral-200' />
					</div>

					{/* Locked Products */}
					{locked.length > 0 && (
						<div className='space-y-1 p-3'>
							{locked.map(product => (
								<Fragment key={product.id}>{renderProduct(product, true)}</Fragment>
							))}
						</div>
					)}

					{/* Meta Products - Tools Section */}
					{meta.length > 0 && (
						<div className='space-y-1 p-3'>
							{meta.map(product => (
								<Fragment key={product.id}>{renderProduct(product)}</Fragment>
							))}
						</div>
					)}
				</div>
			)}

			{/* User Menu */}
			<div className='p-3'>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<button
							className={cn(
								'flex h-11 w-11 items-center justify-center rounded-lg transition-all duration-150',
								'outline-none focus-visible:ring-2 focus-visible:ring-black/20',
								'active:bg-subtle-foreground/50 hover:bg-subtle-foreground/50',
							)}
						>
							<Avatar
								className='h-8 w-8'
								imageWidth={32}
								imageHeight={32}
								imageS3Key={personalWorkspace?.avatarImageS3Key}
								priority
							/>
						</button>
					</DropdownMenuTrigger>
					<DropdownMenuContent side='top' align='start' className='mb-2 min-w-56 p-2.5'>
						{/* User Info Section */}
						<div className='p-3 pt-1.5'>
							<div className='flex flex-col'>
								<Text variant='sm/semibold' className='text-foreground'>
									{personalWorkspace?.name ?? user.name}
								</Text>
								<Text variant='xs/normal' className='text-muted-foreground'>
									{user.email}
								</Text>
							</div>
						</div>

						{/* Menu Items */}
						<DropdownMenuItem asChild>
							<Link
								href='/account/settings'
								className='flex cursor-pointer items-center gap-3 px-3'
							>
								<Icon.user className='h-4 w-4 text-neutral-500' />
								<span>Account</span>
							</Link>
						</DropdownMenuItem>

						<DropdownMenuSeparator />

						{/* Theme Options */}
						<DropdownMenuItem
							onClick={() => setTheme('light')}
							className='flex cursor-pointer items-center gap-3 px-3'
						>
							<Icon.sun className='h-4 w-4 text-neutral-500' />
							<span>Light</span>
							{theme === 'light' && <Icon.check className='ml-auto h-4 w-4' />}
						</DropdownMenuItem>

						<DropdownMenuItem
							onClick={() => setTheme('dark')}
							className='flex cursor-pointer items-center gap-3 px-3'
						>
							<Icon.moon className='h-4 w-4 text-neutral-500' />
							<span>Dark</span>
							{theme === 'dark' && <Icon.check className='ml-auto h-4 w-4' />}
						</DropdownMenuItem>

						<DropdownMenuItem
							onClick={() => setTheme('system')}
							className='flex cursor-pointer items-center gap-3 px-3'
						>
							<Icon.laptop className='h-4 w-4 text-neutral-500' />
							<span>System</span>
							{theme === 'system' && <Icon.check className='ml-auto h-4 w-4' />}
						</DropdownMenuItem>

						<DropdownMenuSeparator />

						<DropdownMenuItem
							onClick={() => authClient.signOut().then(() => router.push('/'))}
							className='flex cursor-pointer items-center gap-3 px-3'
						>
							<Icon.logOut className='h-4 w-4 text-neutral-500' />
							<span>Log out</span>
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</aside>
	);
}
