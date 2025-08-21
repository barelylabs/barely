'use client';

import { useBioStatFilters } from '@barely/hooks';
import { cn, nFormatter } from '@barely/utils';
import { useSuspenseQuery } from '@tanstack/react-query';

import { useTRPC } from '@barely/api/app/trpc.react';

import { Card } from '@barely/ui/card';
import { Icon } from '@barely/ui/icon';
import { H, Text } from '@barely/ui/typography';

export function BioConversionFunnel() {
	const { filtersWithHandle } = useBioStatFilters();

	const trpc = useTRPC();
	const { data: funnel } = useSuspenseQuery(
		trpc.stat.bioConversionFunnel.queryOptions(filtersWithHandle),
	);

	const stages = [
		{
			name: 'Page Views',
			value: funnel.sessions_with_views,
			icon: Icon.view,
			color: 'slate',
		},
		{
			name: 'Link Clicks',
			value: funnel.sessions_with_clicks,
			icon: Icon.click,
			color: 'blue',
			rate: funnel.view_to_click_rate,
		},
		{
			name: 'Email Captures',
			value: funnel.sessions_with_emails,
			icon: Icon.email,
			color: 'green',
			rate: funnel.view_to_email_rate,
		},
	];

	return (
		<Card className='p-6'>
			<div className='mb-6'>
				<H size='4'>Conversion Funnel</H>
				<Text variant='sm/normal' muted>
					Session-based conversion tracking
				</Text>
			</div>

			<div className='space-y-4'>
				{stages.map((stage, index) => (
					<div key={stage.name} className='relative'>
						<div className='flex items-center justify-between'>
							<div className='flex items-center gap-3'>
								<div
									className={cn(
										'rounded-lg p-2',
										stage.color === 'slate' && 'bg-slate-100',
										stage.color === 'blue' && 'bg-blue-100',
										stage.color === 'green' && 'bg-green-100',
									)}
								>
									<stage.icon
										className={cn(
											'h-4 w-4',
											stage.color === 'slate' && 'text-slate-600',
											stage.color === 'blue' && 'text-blue-600',
											stage.color === 'green' && 'text-green-600',
										)}
									/>
								</div>
								<div>
									<Text variant='md/semibold'>{stage.name}</Text>
									{stage.rate !== undefined && (
										<Text variant='sm/normal' muted>
											{(stage.rate * 100).toFixed(1)}% conversion rate
										</Text>
									)}
								</div>
							</div>
							<H size='3'>{nFormatter(stage.value)}</H>
						</div>

						{index < stages.length - 1 && (
							<div className='mb-2 ml-6 mt-2 h-8 border-l-2 border-dashed border-muted' />
						)}
					</div>
				))}
			</div>

			<div className='mt-6 space-y-2 border-t pt-6'>
				<div className='flex justify-between'>
					<Text variant='sm/normal' muted>
						Click-through Rate
					</Text>
					<Text variant='sm/semibold'>
						{(funnel.view_to_click_rate * 100).toFixed(2)}%
					</Text>
				</div>
				<div className='flex justify-between'>
					<Text variant='sm/normal' muted>
						Email Conversion Rate
					</Text>
					<Text variant='sm/semibold'>
						{(funnel.view_to_email_rate * 100).toFixed(2)}%
					</Text>
				</div>
				<div className='flex justify-between'>
					<Text variant='sm/normal' muted>
						Bounce Rate
					</Text>
					<Text variant='sm/semibold'>{(funnel.bounce_rate * 100).toFixed(2)}%</Text>
				</div>
				<div className='flex justify-between'>
					<Text variant='sm/normal' muted>
						Avg Clicks per Session
					</Text>
					<Text variant='sm/semibold'>{funnel.avg_clicks_per_session.toFixed(2)}</Text>
				</div>
			</div>
		</Card>
	);
}
