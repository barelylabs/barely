'use client';

import { useModalHotKeys } from '@barely/hooks';

import { useFanGroup, useFanGroupSearchParams } from '~/app/[handle]/fan-groups/_components/fan-group-context';

export function FanGroupHotkeys() {
	const { selection } = useFanGroup();
	const {
		setShowArchiveModal,
		setShowDeleteModal,
		setShowCreateModal,
		setShowUpdateModal,
	} = useFanGroupSearchParams();

	useModalHotKeys({
		setShowCreateModal,
		setShowUpdateModal,
		setShowArchiveModal,
		setShowDeleteModal,
		itemSelected: selection !== 'all' && !!selection.size,
	});
	return null;
}
