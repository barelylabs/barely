'use client';

import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { cn } from '@barely/utils';

const INVOICE_TABS = [
	{ label: 'Invoices', href: '' },
	{ label: 'Clients', href: '/clients' },
	{ label: 'Stats', href: '/stats' },
	{ label: 'Settings', href: '/settings' },
] as const;

export function InvoiceNav() {
	const params = useParams();
	const handle = params.handle as string;
	const pathname = usePathname();
	const basePath = `/${handle}/invoices`;

	return (
		<div className='flex space-x-1 border-b'>
			{INVOICE_TABS.map(tab => {
				const tabPath = `${basePath}${tab.href}`;
				const isActive =
					tab.href === '' ?
						pathname === basePath || pathname === `${basePath}/`
					:	pathname.startsWith(tabPath);

				return (
					<Link
						key={tab.label}
						href={tabPath}
						className={cn(
							'border-b-2 px-3 py-2 text-sm font-medium transition-colors',
							isActive ?
								'border-primary text-foreground'
							:	'border-transparent text-muted-foreground hover:text-foreground',
						)}
					>
						{tab.label}
					</Link>
				);
			})}
		</div>
	);
}
