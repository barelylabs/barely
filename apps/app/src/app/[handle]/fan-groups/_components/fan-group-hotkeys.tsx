'use client';

import { useModalHotKeys } from '@barely/lib/hooks/use-modal-hot-keys';

import { useFanGroupContext } from '~/app/[handle]/fan-groups/_components/fan-group-context';

export function FanGroupHotkeys() {
	const {
		selection,
		setShowArchiveModal,
		setShowDeleteModal,
		setShowCreateModal,
		setShowUpdateModal,
	} = useFanGroupContext();

	useModalHotKeys({
		setShowCreateModal,
		setShowUpdateModal,
		setShowArchiveModal,
		setShowDeleteModal,
		itemSelected: selection !== 'all' && !!selection.size,
	});
	return null;
}
