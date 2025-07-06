'use client';

import { useModalHotKeys } from '@barely/hooks';

import { useFan, useFanSearchParams } from '~/app/[handle]/fans/_components/fan-context';

export function FanHotkeys() {
	const { selection } = useFan();
	const {
		setShowArchiveModal,
		setShowDeleteModal,
		setShowCreateModal,
		setShowUpdateModal,
	} = useFanSearchParams();

	useModalHotKeys({
		setShowCreateModal,
		setShowUpdateModal,
		setShowArchiveModal,
		setShowDeleteModal,
		itemSelected: selection !== 'all' && !!selection.size,
	});
	return null;
}
