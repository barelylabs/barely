'use client';

import { useModalHotKeys } from '@barely/lib/hooks/use-modal-hot-keys';

import { useLinkContext } from '~/app/[handle]/links/_components/link-context';

export function LinkHotkeys() {
	const {
		selection,
		setShowCreateModal,
		setShowUpdateModal,
		setShowArchiveModal,
		setShowDeleteModal,
	} = useLinkContext();

	useModalHotKeys({
		setShowCreateModal: setShowCreateModal,
		setShowUpdateModal: setShowUpdateModal,
		setShowArchiveModal: setShowArchiveModal,
		setShowDeleteModal: setShowDeleteModal,
		itemSelected: selection !== 'all' && !!selection.size,
	});

	return null;
}
