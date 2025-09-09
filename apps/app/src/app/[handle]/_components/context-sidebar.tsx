'use client';

import type { Product } from '@barely/utils';
import { useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useWorkspace } from '@barely/hooks';
import { cn, getProductById, getSettingsRoutesForVariant } from '@barely/utils';
import { useAtomValue } from 'jotai';

import { navHistoryAtom } from '@barely/atoms/navigation-history';

import { Icon } from '@barely/ui/icon';
import { Text } from '@barely/ui/typography';

interface ProductRoute {
	path: string;
	label: string;
	icon?: string;
	children?: ProductRoute[];
	hideChildrenWhenNotActive?: boolean;
	group?: string;
}

interface ContextSidebarProps {
	productId: string;
}

export function ContextSidebar({ productId }: ContextSidebarProps) {
	const pathname = usePathname();
	const { handle, isPersonal } = useWorkspace();
	// const { hasFeature, isFmVariant } = useCurrentApp();
	const navHistory = useAtomValue(navHistoryAtom);

	const isSettings = pathname.includes('/settings');

	// Settings routes configuration
	const settingsRoutes = useMemo<ProductRoute[]>(() => {
		const baseRoutes = getSettingsRoutesForVariant();

		// Transform the routes and add special handling for team label and email nesting
		return baseRoutes.map(route => {
			// Special handling for team route - show "teams" for personal workspaces
			if (route.path === '/settings/team' && isPersonal) {
				return { ...route, label: 'teams' };
			}

			// Special handling for email route - add nested children
			if (route.path === '/settings/email/domains') {
				return {
					...route,
					hideChildrenWhenNotActive: true,
					children: [
						{ path: '/settings/email/domains', label: 'domains' },
						{ path: '/settings/email/addresses', label: 'addresses' },
					],
				};
			}

			return route;
		});
	}, [isPersonal]);

	// Get product and its routes
	const product = useMemo<
		Product | { id: string; name: string; icon: string; description: string } | undefined
	>(() => {
		if (isSettings) {
			// Return a virtual "settings" product
			return {
				id: 'settings',
				name: 'Settings',
				icon: 'settings',
				description: 'Manage your workspace',
			};
		}
		return getProductById(productId);
	}, [productId, isSettings]);

	const routes = useMemo<ProductRoute[]>(() => {
		if (isSettings) {
			return settingsRoutes;
		}
		// Since we're not using getProductRoutes anymore, get routes from product
		const prod = getProductById(productId);
		return (prod?.routes ?? []) as ProductRoute[];
	}, [productId, isSettings, settingsRoutes]);

	if (!product) return null;

	const renderRoute = (route: ProductRoute, depth = 0) => {
		const fullPath = `/${handle}${route.path}`;
		const isActive = pathname === fullPath || pathname.startsWith(fullPath + '/');
		const hasChildren = route.children && route.children.length > 0;

		// Check if this route group is currently active (for hideChildrenWhenNotActive)
		const isGroupActive =
			hasChildren &&
			route.children?.some(child => {
				const childPath = `/${handle}${child.path}`;
				return pathname === childPath || pathname.startsWith(childPath + '/');
			});

		const IconComponent =
			route.icon ?
				(Icon[route.icon as keyof typeof Icon] as
					| React.ComponentType<{ className?: string }>
					| undefined)
			:	null;

		// For routes with hideChildrenWhenNotActive, show children only when active
		const shouldShowChildren =
			hasChildren && (!route.hideChildrenWhenNotActive || isGroupActive);

		return (
			<div key={route.path}>
				{/* For groups with hideChildrenWhenNotActive that aren't active, show as link */}
				{route.hideChildrenWhenNotActive && !isGroupActive ?
					<Link
						href={fullPath}
						className={cn(
							'group flex w-full items-center gap-2 rounded-md py-1.5 pr-2 hover:bg-accent',
							depth > 0 && 'ml-6',
						)}
					>
						{IconComponent && <IconComponent className='h-[15px] w-[15px]' />}
						<Text variant='sm/medium'>{route.label}</Text>
					</Link>
				:	/* For regular routes or active groups, show as before */
					<>
						{hasChildren && route.hideChildrenWhenNotActive ?
							/* Show group header without link when it's an active group */
							<div
								className={cn(
									'group flex w-full items-center gap-2 rounded-md px-2 py-1.5',
									depth > 0 && 'ml-6',
								)}
							>
								{IconComponent && <IconComponent className='h-[15px] w-[15px]' />}
								<Text variant='sm/medium'>{route.label}</Text>
							</div>
						:	/* Regular link for non-group routes */
							<Link
								href={fullPath}
								className={cn(
									'group flex w-full items-center gap-2 rounded-md px-2 py-1.5 hover:bg-accent/70',
									isActive && 'bg-blue/30 text-blue-600 hover:bg-blue/50',
									depth > 0 && 'ml-6',
								)}
							>
								{IconComponent && <IconComponent className='h-[15px] w-[15px]' />}
								<Text variant='sm/medium'>{route.label}</Text>
							</Link>
						}
					</>
				}

				{/* Show children when appropriate */}
				{shouldShowChildren && route.children && (
					<div
						className={cn(
							'flex flex-col gap-1',
							route.hideChildrenWhenNotActive && 'ml-6 mt-1',
						)}
					>
						{route.children.map(child => renderRoute(child, depth + 1))}
					</div>
				)}
			</div>
		);
	};

	// const ProductIcon =
	// 	product.icon ?
	// 		(Icon[product.icon as keyof typeof Icon] as
	// 			| React.ComponentType<{ className?: string }>
	// 			| undefined)
	// 	:	null;

	return (
		<>
			{/* Background fill for context sidebar area */}
			<div className='fixed left-[60px] top-0 h-screen w-60 bg-accent' />

			{/* Floating context sidebar card */}
			<aside className='fixed left-[64px] top-2 z-40 h-[calc(100vh-1rem)] w-56'>
				<div className='flex h-full flex-col overflow-hidden rounded-xl border border-subtle-foreground/50 bg-card/50 shadow-md'>
					{/* Settings back link or Product Header */}
					{isSettings ?
						<div className='border-b p-4'>
							<Link
								href={navHistory.settingsBackPath ?? `/${handle}/links`}
								passHref
								prefetch={true}
							>
								<div className='flex flex-row items-center'>
									<Icon.chevronLeft className='mr-1 h-4 w-4' />
									<Text variant='md/bold'>Settings</Text>
								</div>
							</Link>
						</div>
					:	<div className='border-b p-4'>
							<div className='flex items-center gap-2.5'>
								{/* {ProductIcon && <ProductIcon className='h-5 w-5 text-neutral-700' />} */}
								<Text variant='md/semibold' className='text-neutral-900'>
									{product.name}
								</Text>
							</div>
							{product.description && (
								<Text variant='xs/normal' className='mt-1.5 text-neutral-500'>
									{product.description}
								</Text>
							)}
						</div>
					}

					{/* Navigation */}
					<div className='flex-1 overflow-y-auto py-3'>
						<div className='flex flex-col gap-1 px-3'>
							{/* Group routes by group property */}
							{(() => {
								const defaultRoutes = routes.filter(r => !r.group);
								const groupedRoutes = routes.filter(r => r.group);
								const groups = [...new Set(groupedRoutes.map(r => r.group))];

								return (
									<>
										{/* Default routes without group */}
										{defaultRoutes.length > 0 && (
											<div className='mb-2 flex flex-col gap-1'>
												{defaultRoutes.map(route => renderRoute(route))}
											</div>
										)}

										{/* Grouped routes */}
										{groups.map(group => (
											<div key={group} className='flex flex-col gap-1'>
												<Text variant='sm/medium' className='px-2 py-1.5 text-primary/60'>
													{group}
												</Text>
												<div className='mb-2 flex flex-col gap-1'>
													{groupedRoutes
														.filter(r => r.group === group)
														.map(route => renderRoute(route))}
												</div>
											</div>
										))}
									</>
								);
							})()}
						</div>
					</div>
				</div>
			</aside>
		</>
	);
}
