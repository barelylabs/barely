'use client';

import type { User } from '@barely/lib/server/routes/user/user.schema';
import type { Workspace } from '@barely/lib/server/routes/workspace/workspace.schema';
import { Fragment, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { usePathnameMatchesCurrentGroup } from '@barely/lib/hooks/use-pathname-matches-current-group';
import { useWorkspace } from '@barely/lib/hooks/use-workspace';
import { useAtomValue } from 'jotai';

import { navHistoryAtom } from '@barely/atoms/navigation-history.atom';

import { usePathnameEndsWith } from '@barely/hooks/use-pathname-matches-current-path';
import { useWorkspaces } from '@barely/hooks/use-workspaces';

import { Icon } from '@barely/ui/elements/icon';
import { ScrollArea } from '@barely/ui/elements/scroll-area';
import { H, Text } from '@barely/ui/elements/typography';

import { cn } from '@barely/utils/cn';

import { UserAccountNav } from '~/app/[handle]/_components/user-menu';
import { WorkspaceSwitcher } from '~/app/[handle]/_components/workspace-switcher';

interface SidebarNavLink {
	title: string;
	href?: string;
	disabled?: boolean;
	external?: boolean;
	icon?: keyof typeof Icon;
	label?: string;
	userFilters?: (keyof User)[];
	workspaceFilters?: (keyof Workspace)[];
}

interface SidebarNavGroup {
	title: string;
	icon?: keyof typeof Icon;
	href?: string;
	links: SidebarNavLink[];
	workspaceFilters?: (keyof Workspace)[];
	hideLinksWhenNotActive?: boolean; // New prop to control visibility of NavLinks
}

type SidebarNavItem = SidebarNavLink | SidebarNavGroup;

export function SidebarNav() {
	// const handle = props.workspace.handle;
	const pathname = usePathname();
	const workspace = useWorkspace();
	const handle = workspace.handle;
	const workspaces = useWorkspaces();

	const allHandles = workspaces.map(workspace => workspace.handle);

	const isSettings = pathname?.includes('/settings');

	const navHistory = useAtomValue(navHistoryAtom);

	const merchLinks: SidebarNavLink[] = [
		{ title: 'products', icon: 'product', href: `/${handle}/products` },
		{ title: 'carts', icon: 'cartFunnel', href: `/${handle}/carts` },
		{ title: 'orders', icon: 'order', href: `/${handle}/orders` },
	];

	const mediaLinks: SidebarNavLink[] = [
		{ title: 'media', icon: 'media', href: `/${handle}/media` },
		{ title: 'tracks', icon: 'music', href: `/${handle}/tracks` },
		{ title: 'mixtapes', icon: 'mixtape', href: `/${handle}/mixtapes` },
	];

	const pageLinks: SidebarNavLink[] = [
		{ title: 'links', icon: 'link', href: `/${handle}/links` },
		{ title: 'fm', icon: 'fm', href: `/${handle}/fm` },
		{ title: 'pages', icon: 'landingPage', href: `/${handle}/pages` },
		{ title: 'press', icon: 'press', href: `/${handle}/press` },
	];

	const emailLinks: SidebarNavLink[] = [
		{ title: 'templates', icon: 'email', href: `/${handle}/email-templates` },
		{
			title: 'template groups',
			icon: 'emailTemplateGroup',
			href: `/${handle}/email-template-groups`,
		},
	];

	const fanLinks: SidebarNavLink[] = [
		{ title: 'fans', icon: 'fans', href: `/${handle}/fans` },
		{ title: 'fan groups', icon: 'fanGroup', href: `/${handle}/fan-groups` },
	];

	const otherLinks: SidebarNavLink[] = [
		{ title: 'flows', icon: 'flow', href: `/${handle}/flows` },
		{ title: 'settings', icon: 'settings', href: `/${handle}/settings` },
	];

	const topMainLinks: SidebarNavItem[] = [
		{
			title: 'content',
			links: mediaLinks,
		},

		{
			title: 'destinations',
			links: pageLinks,
		},

		{
			title: 'merch',
			links: merchLinks,
		},
		{
			title: 'email',
			links: emailLinks,
		},
		{
			title: 'fans',
			links: fanLinks,
		},
		{
			title: 'other',
			links: otherLinks,
		},
	];

	const topSettingsLinks: SidebarNavItem[] = [
		{ title: 'profile', icon: 'profile', href: `/${handle}/settings` },
		{ title: 'socials', icon: 'socials', href: `/${handle}/settings/socials` },
		{ title: 'team', icon: 'users', href: `/${handle}/settings/team` },
		{ title: 'apps', icon: 'apps', href: `/${handle}/settings/apps` },
		{
			title: 'email',
			icon: 'email',
			href: `/${handle}/settings/email/domains`,
			links: [
				{ title: 'domains', href: `/${handle}/settings/email/domains` },
				{
					title: 'addresses',
					href: `/${handle}/settings/email/addresses`,
				},
			],
			hideLinksWhenNotActive: true,
		},
		{
			title: 'domains',
			icon: 'domain',
			href: `/${handle}/settings/domains`,
		},
		{
			title: 'remarketing',
			icon: 'remarketing',
			href: `/${handle}/settings/remarketing`,
		},
		{ title: 'cart', icon: 'cart', href: `/${handle}/settings/cart` },
		{ title: 'payouts', icon: 'payouts', href: `/${handle}/settings/payouts` },
		{ title: 'billing', icon: 'billing', href: `/${handle}/settings/billing` },
	];

	const topLinks = isSettings ? topSettingsLinks : topMainLinks;

	const settingsBackLink = useMemo(() => {
		let bl = navHistory?.settingsBackPath ?? `/${handle}/links`; // eg. /{handle}/settings/profile
		const blHandle = bl.split('/')[1]; // eg. {handle}
		if (blHandle && allHandles.includes(blHandle) && blHandle !== handle)
			bl = bl.replace(`/${blHandle}`, `/${handle}`); // eg. /{handle}/settings/profile
		return bl;
	}, [allHandles, handle, navHistory?.settingsBackPath]);

	return (
		<aside className='fixed left-0 top-14  hidden h-[100vh] max-h-[100vh] w-14 shrink-0 flex-col overflow-y-auto bg-accent px-3 py-3 md:sticky md:flex md:w-56'>
			<WorkspaceSwitcher />

			{isSettings && (
				<Link href={settingsBackLink} passHref>
					<div className='flex flex-row items-center pt-3'>
						<Icon.chevronLeft className='mr-1 h-4 w-4' />
						<Text variant='md/bold'>Settings</Text>
					</div>
				</Link>
			)}

			<ScrollArea className='h-full items-center py-3' hideScrollbar>
				<div className='flex h-full flex-col justify-between'>
					<div className='flex flex-col gap-1'>
						{topLinks.map((item, index) => {
							if (
								item.workspaceFilters &&
								item.workspaceFilters.length > 0 &&
								item.workspaceFilters.map(filter => workspace[filter]).includes(true)
							) {
								return null;
							}

							return (
								<Fragment key={index}>
									<NavItem item={item} handle={handle} />
								</Fragment>
							);
						})}
					</div>
				</div>
			</ScrollArea>
			<div className='flex flex-row items-center justify-between gap-2 px-2'>
				<div className='flex flex-row items-baseline gap-2'>
					<Icon.logo className='h-6 w-6' />
					<div className='bottom-1 flex flex-row items-baseline'>
						<H size='5' className='!text-2xl'>
							barely
							<span className='text-sm'>.io</span>
						</H>
					</div>
				</div>
				<UserAccountNav />
			</div>
		</aside>
	);
}

function NavLink(props: { item: SidebarNavLink; handle: string }) {
	const NavIcon = props.item.icon ? Icon[props.item.icon] : null;

	// const isCurrent = usePathnameMatchesCurrentPath(props.item.href ?? '');
	const isCurrent = usePathnameEndsWith(
		props.item.href?.replace(`/${props.handle}`, '') ?? '',
	);
	return (
		<Link
			href={props.item.href ?? '#'}
			className={cn(
				'group flex w-full items-center gap-2 rounded-md px-2 py-1.5 hover:bg-muted',
				isCurrent && 'bg-muted',
			)}
			passHref
		>
			{NavIcon && <NavIcon className='h-[15px] w-[15px]' />}
			<Text variant='sm/medium'>{props.item.title}</Text>
		</Link>
	);
}

function NavGroup(props: { item: SidebarNavGroup; handle: string }) {
	const NavIcon = props.item.icon ? Icon[props.item.icon] : null;

	const isCurrentGroup = usePathnameMatchesCurrentGroup(
		props.item.links.map(link => link.href ?? ''),
	);

	const groupContent = (
		<>
			{NavIcon && <NavIcon className='h-[15px] w-[15px]' />}
			<Text variant={'sm/medium'}>{props.item.title}</Text>
		</>
	);

	return (
		<>
			{props.item.href && !isCurrentGroup ?
				<Link
					href={isCurrentGroup ? '#' : props.item.links[0]?.href ?? '#'}
					className={cn(
						'group flex w-full items-center gap-2 rounded-md px-2 py-1.5 hover:bg-muted',
						isCurrentGroup && 'bg-muted',
					)}
					passHref
				>
					{groupContent}
				</Link>
			:	<div
					className={cn(
						'group flex w-full items-center gap-2 rounded-md px-2 py-1.5',
						!isCurrentGroup && 'hover:bg-muted',
						// isCurrentGroup && 'bg-muted',
					)}
				>
					{groupContent}
				</div>
			}
			{(!props.item.hideLinksWhenNotActive || isCurrentGroup) && (
				<div
					className={cn(
						'mb-2 flex flex-col gap-1',
						props.item.hideLinksWhenNotActive && 'ml-6',
					)}
				>
					{props.item.links.map((item, index) => (
						<NavLink key={index} item={item} handle={props.handle} />
					))}
				</div>
			)}
		</>
	);
}

function NavItem(props: { item: SidebarNavItem; handle: string }) {
	return 'links' in props.item ?
			<NavGroup item={props.item} handle={props.handle} />
		:	<NavLink item={props.item} handle={props.handle} />;
}
