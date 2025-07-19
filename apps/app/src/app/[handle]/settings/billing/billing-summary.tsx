'use client';

import { useRouter } from 'next/navigation';
import { useUsage, useWorkspaceWithAll } from '@barely/hooks';
import { getPlanNameFromId, nFormatter } from '@barely/utils';

import { Badge } from '@barely/ui/badge';
import { Button } from '@barely/ui/button';
import { Progress } from '@barely/ui/progress';
import { InfoTooltip } from '@barely/ui/tooltip';
import { Text } from '@barely/ui/typography';

export function BillingSummary() {
	const router = useRouter();
	const { plan, handle } = useWorkspaceWithAll();
	const { firstDay, lastDay, linkUsage, usageLimits } = useUsage();

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

			<div className='flex flex-row items-center justify-between px-6 py-5'>
				<Text variant='sm/normal'>
					For higher limits and additional marketing tools, upgrade your plan.
				</Text>
				<Button
					look='primary'
					size='md'
					onClick={() => router.push(`/${handle}/settings/billing/upgrade`)}
				>
					View Plans
				</Button>
			</div>
		</div>
	);
}
