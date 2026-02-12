'use client';

import { useUsage, useWorkspace } from '@barely/hooks';
import { useQuery } from '@tanstack/react-query';

import { useTRPC } from '@barely/api/app/trpc.react';

import { Skeleton } from '@barely/ui/skeleton';
import { Text } from '@barely/ui/typography';

/**
 * Formats event types from Tinybird into human-readable labels
 * e.g., 'link/click' -> 'Link Clicks'
 */
function formatEventType(type: string): string {
	const [category, action] = type.split('/');
	if (!category || !action) return type;

	// Map category/action to human-readable labels
	const categoryLabels: Record<string, string> = {
		link: 'Link',
		fm: 'FM',
		cart: 'Cart',
		page: 'Page',
		bio: 'Bio',
		vip: 'VIP',
		press: 'Press Kit',
	};

	const actionLabels: Record<string, string> = {
		click: 'Clicks',
		view: 'Views',
		purchase: 'Purchases',
		emailCapture: 'Email Captures',
		download: 'Downloads',
		checkoutView: 'Checkout Views',
		checkoutPurchase: 'Purchases',
		buttonClick: 'Button Clicks',
	};

	const categoryLabel = categoryLabels[category] ?? category;
	const actionLabel = actionLabels[action] ?? `${action}s`;

	return `${categoryLabel} ${actionLabel}`;
}

export function EventBreakdown() {
	const trpc = useTRPC();
	const { handle } = useWorkspace();
	const { firstDay, lastDay } = useUsage();

	const { data: breakdown, isLoading } = useQuery({
		...trpc.workspace.eventBreakdown.queryOptions({
			handle,
			start: firstDay.toISOString(),
			end: lastDay.toISOString(),
		}),
	});

	if (isLoading) {
		return (
			<div className='mt-3 space-y-1'>
				<Text variant='xs/medium' className='text-muted-foreground'>
					Breakdown by type:
				</Text>
				<div className='grid grid-cols-2 gap-x-4 gap-y-1'>
					<Skeleton className='h-4 w-24' />
					<Skeleton className='h-4 w-12' />
					<Skeleton className='h-4 w-20' />
					<Skeleton className='h-4 w-10' />
				</div>
			</div>
		);
	}

	if (!breakdown?.length) {
		return null;
	}

	return (
		<div className='mt-3 space-y-1'>
			<Text variant='xs/medium' className='text-muted-foreground'>
				Breakdown by type:
			</Text>
			<div className='grid grid-cols-2 gap-x-4 gap-y-1'>
				{breakdown.map(({ type, count }) => (
					<div key={type} className='col-span-2 flex justify-between text-sm'>
						<Text variant='sm/normal' className='text-muted-foreground'>
							{formatEventType(type)}
						</Text>
						<Text variant='sm/medium'>{count.toLocaleString()}</Text>
					</div>
				))}
			</div>
		</div>
	);
}
