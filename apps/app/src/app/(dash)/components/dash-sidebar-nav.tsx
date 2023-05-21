'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { useAtomValue } from 'jotai';

import { SessionUser } from '@barely/auth/auth-options';

import { Icon } from '@barely/ui/elements/icon';

import { cn } from '@barely/utils/edge/cn';

import { userAtom } from '~/atoms/user.atoms';
import { SidebarNavItem } from '~/types/nav';

export interface SidebarNavProps {
	user: SessionUser | null;
	items: SidebarNavItem[];
}

export function DashSidebarNav(props: SidebarNavProps) {
	const pathname = usePathname();

	const user = useAtomValue(userAtom);

	return props.items.length ? (
		<div className='w-full'>
			{props.items.map((item, index) => {
				const NavIcon = item.icon ? Icon[item.icon] : null;

				if (item.userFilters?.length) {
					// check if user has any of the filters enabled
					const hasFilter = item.userFilters.some(filter => user?.[filter]);
					if (!hasFilter) return null;
				}

				const LinkLabel = (
					<h4 className='flex flex-row mb-1 items-center gap-2 rounded-md px-2 py-1 text-md font-semibold'>
						{NavIcon && <NavIcon />}
						{item.title}
					</h4>
				);

				return (
					<div key={index} className={cn('pb-6')}>
						{item.href ? (
							<Link
								href={item.href}
								target={item.external ? '_blank' : ''}
								rel={item.external ? 'noreferrer' : ''}
								passHref
							>
								{LinkLabel}
							</Link>
						) : (
							LinkLabel
						)}

						{/* <Link
							href={item.href ?? '#'}
							target={item.external ? '_blank' : ''}
							rel={item.external ? 'noreferrer' : ''}
							passHref
						>
							<h4 className='flex flex-row mb-1 items-center gap-2 rounded-md px-2 py-1 text-md font-semibold'>
								{NavIcon && <NavIcon />}
								{item.title}
							</h4>
						</Link> */}
						{!!item?.items?.length && (
							<DashSidebarNavItems user={user} items={item.items} pathname={pathname} />
						)}
					</div>
				);
			})}
		</div>
	) : null;
}

interface DashSidebarNavItemsProps {
	user: SessionUser | null;
	items: SidebarNavItem[];
	pathname: string | null;
}

export function DashSidebarNavItems({ user, items, pathname }: DashSidebarNavItemsProps) {
	return items?.length ? (
		<div className='grid grid-flow-row auto-rows-max text-sm gap-1'>
			{items.map((item, index) =>
				item.userFilters?.length &&
				!item.userFilters.some(filter => user?.[filter]) ? null : item.href ? (
					<Link
						key={index}
						href={item.href}
						className={cn(
							'group flex w-full items-center rounded-md py-1.5 px-2 hover:bg-slate-50 dark:hover:bg-slate-800',
							item.disabled && 'cursor-not-allowed opacity-60',
							{
								'bg-slate-100 dark:bg-slate-800': pathname === item.href,
							},
						)}
						target={item.external ? '_blank' : ''}
						rel={item.external ? 'noreferrer' : ''}
					>
						{item.title}
						{item.label && (
							<span className='ml-2 rounded-md bg-teal-100 px-1.5 py-0.5 text-xs no-underline group-hover:no-underline dark:text-slate-900'>
								{item.label}
							</span>
						)}
					</Link>
				) : (
					<span
						key={index}
						className='flex w-full cursor-not-allowed items-center rounded-md p-2 opacity-60 hover:underline'
					>
						{item.title}
					</span>
				),
			)}
		</div>
	) : null;
}
