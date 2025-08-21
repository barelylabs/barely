import { formatCentsToDollars } from '@barely/utils';
import { format } from 'date-fns';

import { Card } from '@barely/ui/card';
import { Icon } from '@barely/ui/icon';
import { Text } from '@barely/ui/typography';

import { DashContentHeader } from '~/app/[handle]/_components/dash-content-header';
import { HydrateClient, trpc } from '~/trpc/server';

export default async function InvoiceStatsPage({
	params,
}: {
	params: Promise<{ handle: string }>;
}) {
	const awaitedParams = await params;

	// Fetch stats data
	const stats = await trpc.invoice.stats({ handle: awaitedParams.handle });

	return (
		<HydrateClient>
			<DashContentHeader
				title='Invoice Statistics'
				subtitle='Overview of your invoicing performance'
			/>

			<div className='mt-6 space-y-6'>
				{/* Key Metrics */}
				<div className='grid gap-4 md:grid-cols-4'>
					<Card>
						<div className='p-6 pb-2'>
							<div className='flex flex-row items-center justify-between'>
								<h3 className='text-sm font-medium'>Total Revenue</h3>
								<Icon.dollarSign className='h-4 w-4 text-muted-foreground' />
							</div>
						</div>
						<div className='px-6 pb-6'>
							<div className='text-2xl font-bold'>
								{formatCentsToDollars(stats.totalRevenue)}
							</div>
							<p className='text-xs text-muted-foreground'>
								From {stats.paidCount} paid invoices
							</p>
						</div>
					</Card>

					<Card>
						<div className='p-6 pb-2'>
							<div className='flex flex-row items-center justify-between'>
								<h3 className='text-sm font-medium'>Outstanding</h3>
								<Icon.clock className='h-4 w-4 text-muted-foreground' />
							</div>
						</div>
						<div className='px-6 pb-6'>
							<div className='text-2xl font-bold'>
								{formatCentsToDollars(stats.outstanding)}
							</div>
							<p className='text-xs text-muted-foreground'>
								{stats.outstandingCount} unpaid invoices
							</p>
						</div>
					</Card>

					<Card>
						<div className='p-6 pb-2'>
							<div className='flex flex-row items-center justify-between'>
								<h3 className='text-sm font-medium'>Overdue</h3>
								<Icon.alertCircle className='h-4 w-4 text-red-500' />
							</div>
						</div>
						<div className='px-6 pb-6'>
							<div className='text-2xl font-bold text-red-600'>
								{formatCentsToDollars(stats.overdue)}
							</div>
							<p className='text-xs text-muted-foreground'>
								{stats.overdueCount} overdue invoices
							</p>
						</div>
					</Card>

					<Card>
						<div className='p-6 pb-2'>
							<div className='flex flex-row items-center justify-between'>
								<h3 className='text-sm font-medium'>This Month</h3>
								<Icon.calendar className='h-4 w-4 text-muted-foreground' />
							</div>
						</div>
						<div className='px-6 pb-6'>
							<div className='text-2xl font-bold'>
								{formatCentsToDollars(stats.thisMonthRevenue)}
							</div>
							<p className='text-xs text-muted-foreground'>
								{format(new Date(), 'MMMM yyyy')}
							</p>
						</div>
					</Card>
				</div>

				{/* Status Breakdown */}
				<Card>
					<div className='p-6 pb-3'>
						<h3 className='text-lg font-semibold'>Invoice Status Breakdown</h3>
					</div>
					<div className='px-6 pb-6'>
						<div className='space-y-4'>
							<div className='flex items-center justify-between'>
								<div className='flex items-center gap-2'>
									<div className='h-3 w-3 rounded-full bg-gray-400' />
									<Text variant='sm/normal'>Draft</Text>
								</div>
								<Text variant='sm/medium'>{stats.draftCount}</Text>
							</div>

							<div className='flex items-center justify-between'>
								<div className='flex items-center gap-2'>
									<div className='h-3 w-3 rounded-full bg-blue-500' />
									<Text variant='sm/normal'>Sent</Text>
								</div>
								<Text variant='sm/medium'>{stats.sentCount}</Text>
							</div>

							<div className='flex items-center justify-between'>
								<div className='flex items-center gap-2'>
									<div className='h-3 w-3 rounded-full bg-yellow-500' />
									<Text variant='sm/normal'>Viewed</Text>
								</div>
								<Text variant='sm/medium'>{stats.viewedCount}</Text>
							</div>

							<div className='flex items-center justify-between'>
								<div className='flex items-center gap-2'>
									<div className='h-3 w-3 rounded-full bg-green-500' />
									<Text variant='sm/normal'>Paid</Text>
								</div>
								<Text variant='sm/medium'>{stats.paidCount}</Text>
							</div>

							<div className='flex items-center justify-between'>
								<div className='flex items-center gap-2'>
									<div className='h-3 w-3 rounded-full bg-red-500' />
									<Text variant='sm/normal'>Overdue</Text>
								</div>
								<Text variant='sm/medium'>{stats.overdueCount}</Text>
							</div>
						</div>
					</div>
				</Card>

				{/* Average Metrics */}
				<div className='grid gap-4 md:grid-cols-2'>
					<Card>
						<div className='p-6 pb-3'>
							<h3 className='text-lg font-semibold'>Average Invoice Value</h3>
						</div>
						<div className='px-6 pb-6'>
							<div className='text-3xl font-bold'>
								{formatCentsToDollars(stats.averageInvoiceValue)}
							</div>
							<Text variant='sm/normal' muted>
								Based on {stats.totalCount} total invoices
							</Text>
						</div>
					</Card>

					<Card>
						<div className='p-6 pb-3'>
							<h3 className='text-lg font-semibold'>Average Payment Time</h3>
						</div>
						<div className='px-6 pb-6'>
							<div className='text-3xl font-bold'>{stats.averagePaymentDays} days</div>
							<Text variant='sm/normal' muted>
								Average time from sent to paid
							</Text>
						</div>
					</Card>
				</div>
			</div>
		</HydrateClient>
	);
}
