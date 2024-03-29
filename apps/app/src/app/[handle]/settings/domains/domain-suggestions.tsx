import Link from 'next/link';
import { api } from '@barely/server/api/react';

import { Skeleton } from '@barely/ui/elements/skeleton';
import { Text } from '@barely/ui/elements/typography';

export function LinkDomainPurchaseSuggestions() {
	const [suggestedDomains] =
		api.domain.getSuggestedLinkDomainsToPurchase.useSuspenseQuery('properyouth');

	return (
		<div className='grid grid-flow-row grid-cols-3 gap-3'>
			{suggestedDomains && suggestedDomains.length > 0
				? suggestedDomains.map((d, index) => (
						<Link
							href={`/dash/${d.domain}`}
							key={index}
							className='flex flex-col items-center gap-2 rounded-xl border border-border bg-slate-50 px-1 py-2'
						>
							<Text variant='sm/normal'>{d.domain}</Text>
						</Link>
					))
				: null}
		</div>
	);
}

export function LinkDomainPurchaseSuggestionsSkeleton() {
	const LinkSkeleton = () => (
		<div className='flex flex-col items-center gap-2 rounded-xl border border-border bg-slate-50 px-2 py-4'>
			<Skeleton className='h-4 w-32 py-2' />
			<Skeleton className='h-4 w-20 py-2' />
		</div>
	);

	return (
		<div className='grid grid-flow-row grid-cols-3 gap-4'>
			<LinkSkeleton />
			<LinkSkeleton />
			<LinkSkeleton />
			<LinkSkeleton />
			<LinkSkeleton />
			<LinkSkeleton />
		</div>
	);
}
