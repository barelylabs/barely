'use client';

import { Button } from '@barely/ui/button';

import { useVipSwapsSearchParams } from './use-vip-swaps';

export function CreateVipSwapButton() {
	const { setShowCreateModal } = useVipSwapsSearchParams();

	return (
		<Button onClick={() => setShowCreateModal(true)} look='primary'>
			Create VIP Swap
		</Button>
	);
}
