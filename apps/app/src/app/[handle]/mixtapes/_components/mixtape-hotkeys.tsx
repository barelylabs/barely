'use client';

import { useModalHotKeys } from '@barely/hooks';

import { useMixtapesContext } from '~/app/[handle]/mixtapes/_components/mixtape-context';

export function MixtapeHotkeys() {
	const {
		selection,
		setShowArchiveModal,
		setShowDeleteModal,
		setShowCreateModal,
		setShowUpdateModal,
	} = useMixtapesContext();

	useModalHotKeys({
		setShowCreateModal,
		setShowUpdateModal,
		setShowArchiveModal,
		setShowDeleteModal,
		itemSelected: selection !== 'all' && !!selection.size,
	});

	return null;
}
