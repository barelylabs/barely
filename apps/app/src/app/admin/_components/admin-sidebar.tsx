'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@barely/utils';

import { Icon } from '@barely/ui/icon';
import { H } from '@barely/ui/typography';

const adminLinks = [
	{ href: '/admin', label: 'Overview', icon: 'chart' as const },
	{ href: '/admin/users', label: 'Users', icon: 'user' as const },
	{ href: '/admin/workspaces', label: 'Workspaces', icon: 'workspace' as const },
];

export function AdminSidebar() {
	const pathname = usePathname();

	return (
		<aside className='bg-surface flex w-56 shrink-0 flex-col border-r p-4'>
			<div className='mb-6 flex items-center gap-2 px-2'>
				<Icon.shield className='h-5 w-5 text-brand' />
				<H size='4'>Admin</H>
			</div>

			<nav className='flex flex-col gap-1'>
				{adminLinks.map(link => {
					const isActive =
						link.href === '/admin' ?
							pathname === '/admin'
						:	pathname.startsWith(link.href);

					const LinkIcon = Icon[link.icon];

					return (
						<Link
							key={link.href}
							href={link.href}
							className={cn(
								'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
								isActive ?
									'bg-blue/10 text-blue-600 dark:text-blue-400'
								:	'text-muted-foreground hover:bg-muted hover:text-foreground',
							)}
						>
							<LinkIcon className='h-4 w-4' />
							{link.label}
						</Link>
					);
				})}
			</nav>
		</aside>
	);
}
