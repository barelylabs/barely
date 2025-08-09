'use client';

import { useModalHotKeys } from '@barely/hooks';

import { useVipSwaps, useVipSwapsSearchParams } from './use-vip-swaps';

export function VipHotkeys() {
	const { selection } = useVipSwaps();
	const {
		setShowArchiveModal,
		setShowDeleteModal,
		setShowCreateModal,
		setShowUpdateModal,
	} = useVipSwapsSearchParams();

	useModalHotKeys({
		setShowCreateModal,
		setShowUpdateModal,
		setShowArchiveModal,
		setShowDeleteModal,
		itemSelected: selection !== 'all' && !!selection.size,
	});
	return null;
}
