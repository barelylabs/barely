'use client';

import { useRouter } from 'next/navigation';
import { useUsage, useWorkspaceWithAll } from '@barely/hooks';
import { getPlanNameFromId, isInvoiceVariant, nFormatter } from '@barely/utils';

import { Badge } from '@barely/ui/badge';
import { Button } from '@barely/ui/button';
import { Progress } from '@barely/ui/progress';
import { InfoTooltip } from '@barely/ui/tooltip';
import { Text } from '@barely/ui/typography';

// Co-located component: Link usage summary
function LinkUsageSummary() {
	const { linkUsage, usageLimits } = useUsage();

	return (
		<div className='flex flex-col space-y-2 border-b px-6 py-10'>
			<div className='flex items-center space-x-2'>
				<Text variant='lg/semibold'>Total Link Clicks</Text>
				<InfoTooltip content='Number of billable link clicks in the current billing cycle.' />
			</div>

			<Text variant='sm/normal'>
				{nFormatter(linkUsage)} / {nFormatter(usageLimits.linkClicksPerMonth)} clicks (
				{((linkUsage / usageLimits.linkClicksPerMonth) * 100).toFixed(1)}%)
			</Text>
			<Progress size='sm' value={linkUsage} max={usageLimits.linkClicksPerMonth} />
		</div>
	);
}

// Co-located component: Invoice usage summary
function InvoiceUsageSummary() {
	const { invoiceUsage, usageLimits } = useUsage();
	const invoiceLimit = usageLimits.invoicesPerMonth;
	const isUnlimited = invoiceLimit === Number.MAX_SAFE_INTEGER;

	return (
		<div className='flex flex-col space-y-2 border-b px-6 py-10'>
			<div className='flex items-center space-x-2'>
				<Text variant='lg/semibold'>Invoices Created</Text>
				<InfoTooltip content='Number of invoices created in the current billing cycle.' />
			</div>

			<Text variant='sm/normal'>
				{isUnlimited ?
					`${nFormatter(invoiceUsage)} invoices created`
				:	<>
						{nFormatter(invoiceUsage)} / {nFormatter(invoiceLimit)} invoices (
						{((invoiceUsage / invoiceLimit) * 100).toFixed(1)}%)
					</>
				}
			</Text>
			{!isUnlimited && <Progress size='sm' value={invoiceUsage} max={invoiceLimit} />}
		</div>
	);
}

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
	const { firstDay, lastDay } = useUsage();
	const isInvoice = isInvoiceVariant();

	return (
		<div className='flex flex-col rounded-lg border'>
			<div className='flex flex-col space-y-2 border-b px-6 py-10'>
				<Text variant='2xl/semibold'>Plan & Usage</Text>

				<Text variant='sm/normal'>
					You are currently on the <Badge size='xs'>{getPlanNameFromId(plan)}</Badge>{' '}
					plan. Current billing cycle: {firstDay.toLocaleDateString()} -{' '}
					{lastDay.toLocaleDateString()}
				</Text>
			</div>

			{/* Show invoice usage in both app variants */}
			{(isInvoice || plan !== 'free') && <InvoiceUsageSummary />}

			{/* Only show link usage in full app */}
			{!isInvoice && <LinkUsageSummary />}

			<UpgradePrompt />
		</div>
	);
}
