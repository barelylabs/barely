'use client';

import { Card } from '@barely/ui/card';
import { Icon } from '@barely/ui/icon';
import { H, Text } from '@barely/ui/typography';

import { AnimatedSection } from '../shared/animated-section';
import { Container } from '../shared/container';

export function ComparisonTable() {
	const features = [
		{
			feature: 'Starting Price',
			barelyInvoice: 'Free',
			quickBooks: '$30/mo',
			freshBooks: '$17/mo',
			wave: 'Free*',
		},
		{
			feature: 'Clicks to Invoice',
			barelyInvoice: '6',
			quickBooks: '47†',
			freshBooks: '23†',
			wave: '18†',
		},
		{
			feature: 'Recurring Payments',
			barelyInvoice: true,
			quickBooks: true,
			freshBooks: true,
			wave: false,
		},
		{
			feature: 'Accounting Features',
			barelyInvoice: false,
			quickBooks: '✓✓✓',
			freshBooks: '✓✓',
			wave: '✓✓',
		},
		{
			feature: 'Learning Curve',
			barelyInvoice: 'None',
			quickBooks: 'Steep',
			freshBooks: 'Moderate',
			wave: 'Moderate',
		},
		{
			feature: 'Target User',
			barelyInvoice: 'Freelancers',
			quickBooks: 'Businesses',
			freshBooks: 'Agencies',
			wave: 'Small Biz',
		},
	];

	const renderCell = (value: string | boolean) => {
		if (typeof value === 'boolean') {
			return value ?
					<Icon.check className='mx-auto h-5 w-5 text-primary' />
				:	<Icon.x className='mx-auto h-5 w-5 text-muted-foreground' />;
		}
		return value;
	};

	return (
		<section className='bg-muted/30 py-24'>
			<Container>
				<AnimatedSection animation='fade-up' className='mb-12 text-center'>
					<H size='2' className='mb-4'>
						Built for Freelancers, Not Fortune 500s
					</H>
				</AnimatedSection>

				<AnimatedSection animation='fade-up' delay={100}>
					<Card className='overflow-x-auto'>
						<table className='w-full'>
							<thead>
								<tr className='border-b'>
									<th className='p-4 text-left font-medium'></th>
									<th className='p-4 text-center font-medium'>
										<div className='flex flex-col items-center gap-1'>
											<span className='font-semibold text-primary'>Barely Invoice</span>
										</div>
									</th>
									<th className='p-4 text-center font-medium text-muted-foreground'>
										QuickBooks
									</th>
									<th className='p-4 text-center font-medium text-muted-foreground'>
										FreshBooks
									</th>
									<th className='p-4 text-center font-medium text-muted-foreground'>
										Wave
									</th>
								</tr>
							</thead>
							<tbody>
								{features.map((row, index) => (
									<tr key={row.feature} className={index % 2 === 0 ? 'bg-muted/20' : ''}>
										<td className='p-4 text-sm font-medium'>{row.feature}</td>
										<td className='p-4 text-center text-sm font-medium text-primary'>
											{renderCell(row.barelyInvoice)}
										</td>
										<td className='p-4 text-center text-sm text-muted-foreground'>
											{renderCell(row.quickBooks)}
										</td>
										<td className='p-4 text-center text-sm text-muted-foreground'>
											{renderCell(row.freshBooks)}
										</td>
										<td className='p-4 text-center text-sm text-muted-foreground'>
											{renderCell(row.wave)}
										</td>
									</tr>
								))}
							</tbody>
						</table>

						<div className='border-t p-4'>
							<Text variant='xs/normal' className='text-muted-foreground'>
								†Actual count from creating a basic invoice in each platform
							</Text>
							<Text variant='xs/normal' className='text-muted-foreground'>
								*Wave charges payment processing fees only
							</Text>
						</div>
					</Card>
				</AnimatedSection>
			</Container>
		</section>
	);
}
