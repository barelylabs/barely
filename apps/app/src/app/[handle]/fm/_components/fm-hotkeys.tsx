'use client';

import { useModalHotKeys } from '@barely/hooks';

import { useFm, useFmSearchParams } from '~/app/[handle]/fm/_components/fm-context';

export function FmHotkeys() {
	const { selection } = useFm();
	const {
		setShowArchiveModal,
		setShowDeleteModal,
		setShowCreateModal,
		setShowUpdateModal,
	} = useFmSearchParams();

	useModalHotKeys({
		setShowCreateModal,
		setShowUpdateModal,
		setShowArchiveModal,
		setShowDeleteModal,
		itemSelected: selection !== 'all' && !!selection.size,
	});
	return null;
}
