'use client';

import { useWorkspaceWithAll } from '@barely/hooks';
import { capitalize, nFormatter } from '@barely/utils';
import { useSetAtom } from 'jotai';

import { Button } from '@barely/ui/button';
import { Badge } from '@barely/ui/badge';
import { Progress } from '@barely/ui/progress';
import { InfoTooltip } from '@barely/ui/tooltip';
import { Text } from '@barely/ui/typography';

import { showUpgradeModalAtom } from '~/app/[handle]/settings/billing/upgrade-modal';

export function BillingSummary() {
	const { plan, linkUsage, linkUsageLimit } = useWorkspaceWithAll();

	const setShowUpgradeModal = useSetAtom(showUpgradeModalAtom);

	return (
		<div className='flex flex-col rounded-lg border'>
			<div className='flex flex-col space-y-2 border-b px-6 py-10'>
				<Text variant='2xl/semibold'>Plan & Usage</Text>

				<Text variant='sm/normal'>
					You are currently on the <Badge size='xs'>{capitalize(plan)}</Badge> plan.
					Current billing cycle:
				</Text>
			</div>
			<div className='flex flex-col space-y-2 border-b px-6 py-10'>
				<div className='flex items-center space-x-2'>
					<Text variant='lg/semibold'>Total Link Clicks</Text>
					<InfoTooltip content='Number of billable link clicks in the current billing cycle.' />
				</div>

				<Text variant='sm/normal'>
					{nFormatter(linkUsage)} / {nFormatter(linkUsageLimit)} clicks (
					{((linkUsage / linkUsageLimit) * 100).toFixed(1)}%)
				</Text>
				<Progress size='sm' value={linkUsage} max={linkUsageLimit} />
			</div>

			<div className='flex flex-row items-center justify-between px-6 py-5'>
				<Text variant='sm/normal'>
					For higher limits and additional marketing tools, upgrade to the Pro plan.
				</Text>
				<Button look='primary' size='md' onClick={() => setShowUpgradeModal(true)}>
					Upgrade
				</Button>
			</div>
		</div>
	);
}
