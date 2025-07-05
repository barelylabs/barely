'use client';

import Link from 'next/link';
import { useWorkspace } from '@barely/hooks';
import { useTRPC } from '@barely/api/app/trpc.react';
import { useSuspenseQuery } from '@tanstack/react-query';

import { Skeleton } from '@barely/ui/skeleton';
import { Text } from '@barely/ui/typography';

export function LinkDomainPurchaseSuggestions() {
	const trpc = useTRPC();
	const { handle } = useWorkspace();
	const { data: suggestedDomains } = useSuspenseQuery(
		trpc.webDomain.getSuggestedLinkDomainsToPurchase.queryOptions({ handle }),
	);

	return (
		<div className='grid grid-flow-row grid-cols-3 gap-3'>
			{suggestedDomains.length > 0 ?
				suggestedDomains.map((d, index) => (
					<Link
						href={`/dash/${d.domain}`}
						key={index}
						className='flex flex-col items-center gap-2 rounded-xl border border-border bg-slate-50 px-1 py-2'
					>
						<Text variant='sm/normal'>{d.domain}</Text>
					</Link>
				))
			:	null}
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
