// 'use client';

// import type { SessionWorkspace } from '@barely/auth';
// import type { User } from '@barely/validators';
// import { Fragment, useMemo } from 'react';
// import Link from 'next/link';
// import { usePathname } from 'next/navigation';
// import {
// 	useCurrentApp,
// 	usePathnameEndsWith,
// 	usePathnameMatchesCurrentGroup,
// 	useWorkspace,
// 	useWorkspaces,
// } from '@barely/hooks';
// import { cn } from '@barely/utils';
// import { useAtomValue } from 'jotai';

// import { navHistoryAtom } from '@barely/atoms/navigation-history';

// import { Icon } from '@barely/ui/icon';
// import { ScrollArea } from '@barely/ui/scroll-area';
// import { H, Text } from '@barely/ui/typography';

// import { UserAccountNav } from '~/app/[handle]/_components/user-menu';
// import { WorkspaceSwitcher } from '~/app/[handle]/_components/workspace-switcher';

// interface SidebarNavLink {
// 	title: string;
// 	href?: string;
// 	disabled?: boolean;
// 	external?: boolean;
// 	icon?: keyof typeof Icon;
// 	label?: string;
// 	userFilters?: (keyof User)[];
// 	workspaceFilters?: (keyof SessionWorkspace)[];
// }

// interface SidebarNavGroup {
// 	title: string;
// 	icon?: keyof typeof Icon;
// 	href?: string;
// 	links: SidebarNavLink[];
// 	workspaceFilters?: (keyof SessionWorkspace)[];
// 	hideLinksWhenNotActive?: boolean; // New prop to control visibility of NavLinks
// }

// type SidebarNavItem = SidebarNavLink | SidebarNavGroup;

// export function SidebarNav() {
// 	const pathname = usePathname();
// 	const { workspace, handle, isPersonal } = useWorkspace();
// 	const { isFmVariant, hasFeature } = useCurrentApp();

// 	const workspaces = useWorkspaces();

// 	const allHandles = useMemo(
// 		() => workspaces.map(workspace => workspace.handle),
// 		[workspaces],
// 	);

// 	const isSettings = pathname.includes('/settings');

// 	const navHistory = useAtomValue(navHistoryAtom);

// 	const merchLinks = useMemo<SidebarNavLink[]>(
// 		() => [
// 			{ title: 'products', icon: 'product', href: `/${handle}/products` },
// 			{ title: 'carts', icon: 'cartFunnel', href: `/${handle}/carts` },
// 			{ title: 'orders', icon: 'order', href: `/${handle}/orders` },
// 		],
// 		[handle],
// 	);

// 	const mediaLinks = useMemo<SidebarNavLink[]>(
// 		() => [
// 			{ title: 'media', icon: 'media', href: `/${handle}/media` },
// 			{ title: 'tracks', icon: 'music', href: `/${handle}/tracks` },
// 			{ title: 'mixtapes', icon: 'mixtape', href: `/${handle}/mixtapes` },
// 			// { title: 'spotify stats', icon: 'spotify', href: `/${handle}/spotify/stats` },
// 		],
// 		[handle],
// 	);

// 	const pageLinks = useMemo<SidebarNavLink[]>(
// 		() => [
// 			{ title: 'links', icon: 'link', href: `/${handle}/links` },
// 			{ title: 'fm', icon: 'fm', href: `/${handle}/fm` },
// 			{ title: 'pages', icon: 'landingPage', href: `/${handle}/pages` },
// 			{ title: 'press', icon: 'press', href: `/${handle}/press` },
// 			{ title: 'vip', icon: 'vip', href: `/${handle}/vip/swaps` },
// 		],
// 		[handle],
// 	);

// 	const emailLinks = useMemo<SidebarNavLink[]>(
// 		() => [
// 			{ title: 'broadcasts', icon: 'broadcast', href: `/${handle}/email/broadcasts` },
// 			{ title: 'templates', icon: 'email', href: `/${handle}/email/templates` },
// 			{
// 				title: 'template groups',
// 				icon: 'emailTemplateGroup',
// 				href: `/${handle}/email/template-groups`,
// 			},
// 		],
// 		[handle],
// 	);

// 	const fanLinks = useMemo<SidebarNavLink[]>(
// 		() => [
// 			{ title: 'fans', icon: 'fans', href: `/${handle}/fans` },
// 			{ title: 'fan groups', icon: 'fanGroup', href: `/${handle}/fan-groups` },
// 		],
// 		[handle],
// 	);

// 	const otherLinks = useMemo<SidebarNavLink[]>(
// 		() => [
// 			{ title: 'flows', icon: 'flow', href: `/${handle}/flows` },
// 			{ title: 'settings', icon: 'settings', href: `/${handle}/settings` },
// 		],
// 		[handle],
// 	);

// 	// Build navigation based on app variant
// 	const topMainLinks: SidebarNavItem[] = useMemo(() => {
// 		// For FM variant, show only FM-relevant navigation
// 		if (isFmVariant) {
// 			return [
// 				{
// 					title: 'fm',
// 					links: [{ title: 'fm', icon: 'fm', href: `/${handle}/fm` }],
// 				},
// 				{
// 					title: 'content',
// 					links: [{ title: 'media', icon: 'media', href: `/${handle}/media` }],
// 				},
// 				{
// 					title: 'other',
// 					links: [{ title: 'settings', icon: 'settings', href: `/${handle}/settings` }],
// 				},
// 			];
// 		}

// 		// For full app, show everything
// 		const allLinks: SidebarNavItem[] = [];

// 		// Only add groups if they have features enabled
// 		if (hasFeature('media') || hasFeature('tracks') || hasFeature('mixtapes')) {
// 			allLinks.push({
// 				title: 'content',
// 				links: mediaLinks.filter(link => {
// 					if (link.title === 'media') return hasFeature('media');
// 					if (link.title === 'tracks') return hasFeature('tracks');
// 					if (link.title === 'mixtapes') return hasFeature('mixtapes');
// 					return true;
// 				}),
// 			});
// 		}

// 		if (
// 			hasFeature('links') ||
// 			hasFeature('fm') ||
// 			hasFeature('bio-pages') ||
// 			hasFeature('press-kits') ||
// 			hasFeature('campaigns')
// 		) {
// 			allLinks.push({
// 				title: 'destinations',
// 				links: pageLinks.filter(link => {
// 					if (link.title === 'links') return hasFeature('links');
// 					if (link.title === 'fm') return hasFeature('fm');
// 					if (link.title === 'pages') return hasFeature('bio-pages');
// 					if (link.title === 'press') return hasFeature('press-kits');
// 					if (link.title === 'vip') return hasFeature('campaigns');
// 					return true;
// 				}),
// 			});
// 		}

// 		if (hasFeature('products')) {
// 			allLinks.push({
// 				title: 'merch',
// 				links: merchLinks,
// 			});
// 		}

// 		if (hasFeature('forms')) {
// 			allLinks.push({
// 				title: 'email',
// 				href: `/${handle}/email/broadcasts`,
// 				links: emailLinks,
// 			});
// 		}

// 		if (hasFeature('fans') || hasFeature('fan-group')) {
// 			allLinks.push({
// 				title: 'fans',
// 				links: fanLinks.filter(link => {
// 					if (link.title === 'fans') return hasFeature('fans');
// 					if (link.title === 'fan groups') return hasFeature('fan-group');
// 					return true;
// 				}),
// 			});
// 		}

// 		// Always show 'other' section with available items
// 		const otherFilteredLinks = otherLinks.filter(link => {
// 			if (link.title === 'flows') return hasFeature('analytics');
// 			if (link.title === 'settings') return hasFeature('settings');
// 			return true;
// 		});

// 		if (otherFilteredLinks.length > 0) {
// 			allLinks.push({
// 				title: 'other',
// 				links: otherFilteredLinks,
// 			});
// 		}

// 		return allLinks;
// 	}, [
// 		handle,
// 		isFmVariant,
// 		hasFeature,
// 		mediaLinks,
// 		pageLinks,
// 		merchLinks,
// 		emailLinks,
// 		fanLinks,
// 		otherLinks,
// 	]);

// 	const topSettingsLinks: SidebarNavItem[] = useMemo(() => {
// 		// For FM variant, only show essential settings
// 		if (isFmVariant) {
// 			return [
// 				{ title: 'profile', icon: 'profile', href: `/${handle}/settings` },
// 				{ title: 'billing', icon: 'billing', href: `/${handle}/settings/billing` },
// 			];
// 		}

// 		// For full app, show all settings based on features
// 		const allSettingsLinks: SidebarNavItem[] = [
// 			{ title: 'profile', icon: 'profile', href: `/${handle}/settings` },
// 		];

// 		if (hasFeature('team')) {
// 			allSettingsLinks.push({
// 				title: isPersonal ? 'teams' : 'team',
// 				icon: 'users',
// 				href: `/${handle}/settings/team`,
// 			});
// 		}

// 		if (hasFeature('settings')) {
// 			allSettingsLinks.push(
// 				{ title: 'socials', icon: 'socials', href: `/${handle}/settings/socials` },
// 				{ title: 'streaming', icon: 'music', href: `/${handle}/settings/streaming` },
// 				{ title: 'apps', icon: 'apps', href: `/${handle}/settings/apps` },
// 				{
// 					title: 'email',
// 					icon: 'email',
// 					href: `/${handle}/settings/email/domains`,
// 					links: [
// 						{ title: 'domains', href: `/${handle}/settings/email/domains` },
// 						{
// 							title: 'addresses',
// 							href: `/${handle}/settings/email/addresses`,
// 						},
// 					],
// 					hideLinksWhenNotActive: true,
// 				},
// 				{
// 					title: 'domains',
// 					icon: 'domain',
// 					href: `/${handle}/settings/domains`,
// 				},
// 				{
// 					title: 'remarketing',
// 					icon: 'remarketing',
// 					href: `/${handle}/settings/remarketing`,
// 				},
// 			);
// 		}

// 		if (hasFeature('campaigns')) {
// 			allSettingsLinks.push({
// 				title: 'vip',
// 				icon: 'vip',
// 				href: `/${handle}/settings/vip`,
// 			});
// 		}

// 		if (hasFeature('products')) {
// 			allSettingsLinks.push({
// 				title: 'cart',
// 				icon: 'cart',
// 				href: `/${handle}/settings/cart`,
// 			});
// 		}

// 		if (hasFeature('settings')) {
// 			allSettingsLinks.push(
// 				{ title: 'payouts', icon: 'payouts', href: `/${handle}/settings/payouts` },
// 				{ title: 'billing', icon: 'billing', href: `/${handle}/settings/billing` },
// 			);
// 		}

// 		return allSettingsLinks;
// 	}, [handle, isFmVariant, hasFeature, isPersonal]);

// 	const topLinks = isSettings ? topSettingsLinks : topMainLinks;

// 	const settingsBackLink = useMemo(() => {
// 		let bl = navHistory.settingsBackPath ?? `/${handle}/links`; // eg. /{handle}/settings/profile
// 		const blHandle = bl.split('/')[1]; // eg. {handle}
// 		if (blHandle && allHandles.includes(blHandle) && blHandle !== handle)
// 			bl = bl.replace(`/${blHandle}`, `/${handle}`); // eg. /{handle}/settings/profile
// 		return bl;
// 	}, [allHandles, handle, navHistory.settingsBackPath]);

// 	return (
// 		<aside className='fixed left-0 top-14 hidden h-[100vh] max-h-[100vh] w-14 shrink-0 flex-col overflow-y-auto bg-accent px-3 py-3 md:sticky md:flex md:w-56'>
// 			<WorkspaceSwitcher />

// 			{isSettings && (
// 				<Link href={settingsBackLink} passHref prefetch={true}>
// 					<div className='flex flex-row items-center pt-3'>
// 						<Icon.chevronLeft className='mr-1 h-4 w-4' />
// 						<Text variant='md/bold'>Settings</Text>
// 					</div>
// 				</Link>
// 			)}

// 			{/* <ScrollArea className='h-full items-center py-3' hideScrollbar> */}
// 			<ScrollArea className='h-full items-center py-3'>
// 				<div className='flex h-full flex-col justify-between'>
// 					<div className='flex flex-col gap-1'>
// 						{topLinks.map((item, index) => {
// 							if (item.workspaceFilters?.some(filter => Boolean(workspace[filter]))) {
// 								return null;
// 							}

// 							return (
// 								<Fragment key={index}>
// 									<NavItem item={item} handle={handle} />
// 								</Fragment>
// 							);
// 						})}
// 					</div>
// 				</div>
// 			</ScrollArea>
// 			<div className='flex flex-row items-center justify-between gap-2 px-2'>
// 				<div className='flex flex-row items-baseline gap-2'>
// 					<Icon.logo className='h-6 w-6' />
// 					<div className='bottom-1 flex flex-row items-baseline'>
// 						<H size='5' className='!text-2xl'>
// 							barely
// 							<span className='text-sm'>.io</span>
// 						</H>
// 					</div>
// 				</div>
// 				<UserAccountNav />
// 			</div>
// 		</aside>
// 	);
// }

// function NavLink(props: { item: SidebarNavLink; handle: string }) {
// 	const NavIcon = props.item.icon ? Icon[props.item.icon] : null;

// 	// const isCurrent = usePathnameMatchesCurrentPath(props.item.href ?? '');
// 	const isCurrent = usePathnameEndsWith(
// 		props.item.href?.replace(`/${props.handle}`, '') ?? '',
// 	);
// 	return (
// 		<Link
// 			href={props.item.href ?? '#'}
// 			className={cn(
// 				'group flex w-full items-center gap-2 rounded-md px-2 py-1.5 hover:bg-muted',
// 				isCurrent && 'bg-muted',
// 			)}
// 			passHref
// 			prefetch={true}
// 		>
// 			{NavIcon && <NavIcon className='h-[15px] w-[15px]' />}
// 			<Text variant='sm/medium'>{props.item.title}</Text>
// 		</Link>
// 	);
// }

// function NavGroup(props: { item: SidebarNavGroup; handle: string }) {
// 	const NavIcon = props.item.icon ? Icon[props.item.icon] : null;

// 	const isCurrentGroup = usePathnameMatchesCurrentGroup(
// 		props.item.links.map(link => link.href ?? ''),
// 	);

// 	const groupContent = (
// 		<>
// 			{NavIcon && <NavIcon className='h-[15px] w-[15px]' />}
// 			<Text variant={'sm/medium'}>{props.item.title}</Text>
// 		</>
// 	);

// 	return (
// 		<>
// 			{props.item.href && !isCurrentGroup ?
// 				<Link
// 					prefetch={true}
// 					href={props.item.links[0]?.href ?? '#'}
// 					className={cn(
// 						'group flex w-full items-center gap-2 rounded-md px-2 py-1.5 hover:bg-muted',
// 						'bg-muted',
// 					)}
// 					passHref
// 				>
// 					{groupContent}
// 				</Link>
// 			:	<div
// 					className={cn(
// 						'group flex w-full items-center gap-2 rounded-md px-2 py-1.5',
// 						!isCurrentGroup && 'hover:bg-muted',
// 						// isCurrentGroup && 'bg-muted',
// 					)}
// 				>
// 					{groupContent}
// 				</div>
// 			}
// 			{(!props.item.hideLinksWhenNotActive || isCurrentGroup) && (
// 				<div
// 					className={cn(
// 						'mb-2 flex flex-col gap-1',
// 						props.item.hideLinksWhenNotActive && 'ml-6',
// 					)}
// 				>
// 					{props.item.links.map((item, index) => (
// 						<NavLink key={index} item={item} handle={props.handle} />
// 					))}
// 				</div>
// 			)}
// 		</>
// 	);
// }

// function NavItem(props: { item: SidebarNavItem; handle: string }) {
// 	return 'links' in props.item ?
// 			<NavGroup item={props.item} handle={props.handle} />
// 		:	<NavLink item={props.item} handle={props.handle} />;
// }
