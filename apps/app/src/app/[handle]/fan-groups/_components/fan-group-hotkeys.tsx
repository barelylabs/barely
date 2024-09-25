'use client';

import { useModalHotKeys } from '@barely/lib/hooks/use-modal-hot-keys';

import { useFanGroupContext } from '~/app/[handle]/fan-groups/_components/fan-group-context';

export function FanGroupHotkeys() {
	const {
		fanGroupSelection,
		setShowArchiveFanGroupModal,
		setShowDeleteFanGroupModal,
		setShowCreateFanGroupModal,
		setShowUpdateFanGroupModal,
	} = useFanGroupContext();

	useModalHotKeys({
		setShowCreateModal: setShowCreateFanGroupModal,
		setShowUpdateModal: setShowUpdateFanGroupModal,
		setShowArchiveModal: setShowArchiveFanGroupModal,
		setShowDeleteModal: setShowDeleteFanGroupModal,
		itemSelected: fanGroupSelection !== 'all' && !!fanGroupSelection.size,
	});
	return null;
}
