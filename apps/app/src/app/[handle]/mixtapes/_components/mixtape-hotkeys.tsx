'use client';

import { useModalHotKeys } from '@barely/lib/hooks/use-modal-hot-keys';

import { useMixtapesContext } from '~/app/[handle]/mixtapes/_components/mixtape-context';

export function MixtapeHotkeys() {
	const {
		mixtapeSelection,
		setShowArchiveMixtapeModal,
		setShowDeleteMixtapeModal,
		setShowCreateMixtapeModal,
		setShowUpdateMixtapeModal,
	} = useMixtapesContext();

	useModalHotKeys({
		setShowCreateModal: setShowCreateMixtapeModal,
		setShowUpdateModal: setShowUpdateMixtapeModal,
		setShowArchiveModal: setShowArchiveMixtapeModal,
		setShowDeleteModal: setShowDeleteMixtapeModal,
		itemSelected: mixtapeSelection !== 'all' && !!mixtapeSelection.size,
	});

	return null;
}
