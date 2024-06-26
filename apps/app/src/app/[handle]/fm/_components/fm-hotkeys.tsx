'use client';

import { useModalHotKeys } from '@barely/lib/hooks/use-modal-hot-keys';

import { useFmContext } from '~/app/[handle]/fm/_components/fm-context';

export function FmHotkeys() {
	const {
		fmPageSelection,
		setShowArchiveFmPageModal,
		setShowDeleteFmPageModal,
		setShowCreateFmPageModal,
		setShowUpdateFmPageModal,
	} = useFmContext();

	useModalHotKeys({
		setShowCreateModal: setShowCreateFmPageModal,
		setShowUpdateModal: setShowUpdateFmPageModal,
		setShowArchiveModal: setShowArchiveFmPageModal,
		setShowDeleteModal: setShowDeleteFmPageModal,
		itemSelected: fmPageSelection !== 'all' && !!fmPageSelection.size,
	});
	return null;
}
