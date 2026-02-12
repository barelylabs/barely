'use client';

import { useRouter } from 'next/navigation';
import { useUsage, useWorkspaceWithAll } from '@barely/hooks';
import { getPlanNameFromId, isInvoiceVariant } from '@barely/utils';

import { Badge } from '@barely/ui/badge';
import { Button } from '@barely/ui/button';
import { Text } from '@barely/ui/typography';

import { EventBreakdown } from './_components/event-breakdown';
import { UsageMetricCard } from './_components/usage-metric-card';

// Co-located component: Upgrade prompt
function UpgradePrompt() {
	const router = useRouter();
	const { handle, plan } = useWorkspaceWithAll();
	const isInvoice = isInvoiceVariant();

	// Different messaging based on app variant and plan
	const getUpgradeMessage = () => {
		if (isInvoice) {
			if (plan === 'free') {
				return 'Upgrade for unlimited invoices, recurring billing, and premium features.';
			}
			return 'Need more features? Check out our plans.';
		}

		// Full app messaging
		if (plan === 'free') {
			return 'For higher limits and additional marketing tools, upgrade your plan.';
		}
		return 'Need more capacity? Check out our plans.';
	};

	const getButtonText = () => {
		if (plan === 'free') return 'Upgrade';
		return 'View Plans';
	};

	return (
		<div className='flex flex-row items-center justify-between px-6 py-5'>
			<Text variant='sm/normal'>{getUpgradeMessage()}</Text>
			<Button
				look='primary'
				size='md'
				onClick={() => router.push(`/${handle}/settings/billing/upgrade`)}
			>
				{getButtonText()}
			</Button>
		</div>
	);
}

export function BillingSummary() {
	const { plan } = useWorkspaceWithAll();
	const { firstDay, lastDay, metrics } = useUsage();
	const isInvoice = isInvoiceVariant();

	return (
		<div className='flex flex-col rounded-lg border'>
			{/* Plan Info Header */}
			<div className='flex flex-col space-y-2 border-b px-6 py-10'>
				<Text variant='2xl/semibold'>Plan & Usage</Text>

				<Text variant='sm/normal'>
					You are currently on the <Badge size='xs'>{getPlanNameFromId(plan)}</Badge>{' '}
					plan. Current billing cycle: {firstDay.toLocaleDateString()} -{' '}
					{lastDay.toLocaleDateString()}
				</Text>
			</div>

			{/* Usage Metrics Grid */}
			<div className='grid grid-cols-1 gap-6 border-b px-6 py-10 md:grid-cols-2'>
				{/* Invoice usage - shown in both app variants */}
				{(isInvoice || plan !== 'free') && (
					<UsageMetricCard
						label='Invoices Created'
						current={metrics.invoices.current}
						limit={metrics.invoices.limit}
						unit='invoices'
						isUnlimited={metrics.invoices.isUnlimited}
						tooltipContent='Number of invoices created in the current billing cycle.'
						showUpgradeCta={false}
					/>
				)}

				{/* Full app metrics */}
				{!isInvoice && (
					<>
						{/* Events with Breakdown - spans full width */}
						<div className='col-span-1 md:col-span-2'>
							<UsageMetricCard
								label='Tracked Events'
								current={metrics.events.current}
								limit={metrics.events.limit}
								unit='events'
								isUnlimited={metrics.events.isUnlimited}
								tooltipContent='Total tracked events in the current billing cycle. Includes link clicks, page views, and other interactions.'
								showUpgradeCta={false}
							/>
							<EventBreakdown />
						</div>

						<UsageMetricCard
							label='Links Created'
							current={metrics.links.current}
							limit={metrics.links.limit}
							unit='links'
							isUnlimited={metrics.links.isUnlimited}
							tooltipContent='Number of new links created in the current billing cycle.'
							showUpgradeCta={false}
						/>

						<UsageMetricCard
							label='Emails Sent'
							current={metrics.emails.current}
							limit={metrics.emails.limit}
							unit='emails'
							isUnlimited={metrics.emails.isUnlimited}
							tooltipContent='Number of emails sent in the current billing cycle.'
							showUpgradeCta={false}
						/>

						<UsageMetricCard
							label='Fans/Contacts'
							current={metrics.fans.current}
							limit={metrics.fans.limit}
							unit='fans'
							isUnlimited={metrics.fans.isUnlimited}
							tooltipContent='Total number of fans and contacts in your workspace.'
							showUpgradeCta={false}
						/>

						<UsageMetricCard
							label='Team Members'
							current={metrics.members.current}
							limit={metrics.members.limit}
							unit='members'
							isUnlimited={metrics.members.isUnlimited}
							tooltipContent='Total number of team members in your workspace.'
							showUpgradeCta={false}
						/>
					</>
				)}
			</div>

			<UpgradePrompt />
		</div>
	);
}
