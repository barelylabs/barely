'use client';

import { useModalHotKeys } from '@barely/hooks';

import { useMixtape, useMixtapeSearchParams } from '~/app/[handle]/mixtapes/_components/mixtape-context';

export function MixtapeHotkeys() {
	const { selection } = useMixtape();
	const {
		setShowArchiveModal,
		setShowDeleteModal,
		setShowCreateModal,
		setShowUpdateModal,
	} = useMixtapeSearchParams();

	useModalHotKeys({
		setShowCreateModal,
		setShowUpdateModal,
		setShowArchiveModal,
		setShowDeleteModal,
		itemSelected: selection !== 'all' && !!selection.size,
	});

	return null;
}
