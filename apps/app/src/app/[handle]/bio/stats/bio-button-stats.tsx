'use client';

import { useBioStatFilters, useWorkspace } from '@barely/hooks';
import { nFormatter } from '@barely/utils';
import { useSuspenseQuery } from '@tanstack/react-query';

import { useTRPC } from '@barely/api/app/trpc.react';

import { Card } from '@barely/ui/card';
import { Icon } from '@barely/ui/icon';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@barely/ui/table';
import { H, Text } from '@barely/ui/typography';

export function BioButtonStats() {
	const { filtersWithHandle } = useBioStatFilters();
	const { handle } = useWorkspace();

	const trpc = useTRPC();

	// Get bio button stats from Tinybird
	const { data: buttonStats } = useSuspenseQuery(
		trpc.stat.bioButtonStats.queryOptions({ ...filtersWithHandle }),
	);

	// Get bio information to match URLs to button names
	const { data: bios } = useSuspenseQuery(
		trpc.bio.byWorkspace.queryOptions(
			{ handle, showArchived: false },
			{
				select: data => {
					// Create a map of URLs to button texts
					const urlToButton = new Map<string, string>();
					data.bios.forEach(bio => {
						bio.buttons.forEach(button => {
							if (button.link?.url) {
								urlToButton.set(button.link.url, button.text);
							} else if (button.email) {
								urlToButton.set(`mailto:${button.email}`, button.text);
							} else if (button.phone) {
								urlToButton.set(`tel:${button.phone}`, button.text);
							}
						});
					});
					return urlToButton;
				},
			},
		),
	);

	// Sort button stats by clicks descending
	const sortedStats = [...buttonStats].sort((a, b) => b.clicks - a.clicks);

	// Calculate total clicks for percentage calculation
	const totalClicks = sortedStats.reduce((acc, stat) => acc + stat.clicks, 0);

	if (sortedStats.length === 0) {
		return (
			<Card className='p-6'>
				<div className='flex flex-col items-center justify-center py-8 text-center'>
					<Icon.click className='mb-4 h-8 w-8 text-muted-foreground' />
					<H size='4' className='mb-2'>
						No Button Clicks Yet
					</H>
					<Text variant='sm/normal' className='text-muted-foreground'>
						Button click data will appear here once visitors start clicking buttons on
						your bio pages.
					</Text>
				</div>
			</Card>
		);
	}

	return (
		<Card className='p-6'>
			<div className='mb-4'>
				<H size='4'>Button Performance</H>
				<Text variant='sm/normal' className='text-muted-foreground'>
					Individual button click statistics for your bio pages
				</Text>
			</div>

			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Button</TableHead>
						<TableHead>Destination</TableHead>
						<TableHead className='text-right'>Clicks</TableHead>
						<TableHead className='text-right'>% of Total</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{sortedStats.map((stat, index) => {
						const buttonText = stat.buttonUrl ? bios.get(stat.buttonUrl) : null;
						const percentage = totalClicks > 0 ? (stat.clicks / totalClicks) * 100 : 0;

						// Determine icon based on URL pattern
						let iconName: keyof typeof Icon = 'link';
						if (stat.buttonUrl?.startsWith('mailto:')) {
							iconName = 'email';
						} else if (stat.buttonUrl?.startsWith('tel:')) {
							iconName = 'phone';
						} else if (stat.buttonUrl?.includes('spotify.com')) {
							iconName = 'spotify';
						} else if (stat.buttonUrl?.includes('instagram.com')) {
							iconName = 'instagram';
						} else if (stat.buttonUrl?.includes('youtube.com')) {
							iconName = 'youtube';
						} else if (stat.buttonUrl?.includes('tiktok.com')) {
							iconName = 'tiktok';
						} else if (
							stat.buttonUrl?.includes('twitter.com') ||
							stat.buttonUrl?.includes('x.com')
						) {
							iconName = 'twitter';
						} else if (stat.buttonUrl?.includes('facebook.com')) {
							iconName = 'facebook';
						}

						const IconComponent = Icon[iconName];

						return (
							<TableRow key={index}>
								<TableCell>
									<div className='flex items-center gap-2'>
										<IconComponent className='h-4 w-4 text-muted-foreground' />
										<Text variant='sm/medium'>{buttonText ?? 'Unknown Button'}</Text>
									</div>
								</TableCell>
								<TableCell>
									<span title={stat.buttonUrl ?? undefined}>
										<Text
											variant='xs/normal'
											className='max-w-[200px] truncate text-muted-foreground'
										>
											{stat.buttonUrl ?? 'No URL'}
										</Text>
									</span>
								</TableCell>
								<TableCell className='text-right'>
									<Text variant='sm/medium'>{nFormatter(stat.clicks)}</Text>
								</TableCell>
								<TableCell className='text-right'>
									<div className='flex items-center justify-end gap-2'>
										<div className='h-2 w-16 rounded-full bg-gray-200'>
											<div
												className='h-2 rounded-full bg-blue'
												style={{ width: `${Math.min(percentage, 100)}%` }}
											/>
										</div>
										<Text variant='sm/normal' className='text-muted-foreground'>
											{percentage.toFixed(1)}%
										</Text>
									</div>
								</TableCell>
							</TableRow>
						);
					})}
				</TableBody>
			</Table>
		</Card>
	);
}
