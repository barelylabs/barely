'use client';

import { useModalHotKeys } from '@barely/lib/hooks/use-modal-hot-keys';

import { useFanContext } from '~/app/[handle]/fans/_components/fan-context';

export function FanHotkeys() {
	const {
		fanSelection,
		setShowArchiveFanModal,
		setShowDeleteFanModal,
		setShowCreateFanModal,
		setShowUpdateFanModal,
	} = useFanContext();

	useModalHotKeys({
		setShowCreateModal: setShowCreateFanModal,
		setShowUpdateModal: setShowUpdateFanModal,
		setShowArchiveModal: setShowArchiveFanModal,
		setShowDeleteModal: setShowDeleteFanModal,
		itemSelected: fanSelection !== 'all' && !!fanSelection.size,
	});
	return null;
}
