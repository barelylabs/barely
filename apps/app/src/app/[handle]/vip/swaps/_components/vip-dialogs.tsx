'use client';

import { useWorkspaceWithAll } from '@barely/hooks';

import { Alert } from '@barely/ui/alert';

export function VipDialogs() {
	const { handle, vipSupportEmail } = useWorkspaceWithAll();

	if (vipSupportEmail) return null;

	return (
		<Alert
			variant='warning'
			title='Support email required'
			actionLabel='Set up a support email for VIP customers'
			actionHref={`/${handle}/settings/vip`}
		/>
	);
}
