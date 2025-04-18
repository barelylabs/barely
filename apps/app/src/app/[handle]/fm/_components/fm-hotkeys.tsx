'use client';

import { useModalHotKeys } from '@barely/lib/hooks/use-modal-hot-keys';

import { useFmContext } from '~/app/[handle]/fm/_components/fm-context';

export function FmHotkeys() {
	const {
		selection,
		setShowArchiveModal,
		setShowDeleteModal,
		setShowCreateModal,
		setShowUpdateModal,
	} = useFmContext();

	useModalHotKeys({
		setShowCreateModal,
		setShowUpdateModal,
		setShowArchiveModal,
		setShowDeleteModal,
		itemSelected: selection !== 'all' && !!selection.size,
	});
	return null;
}
