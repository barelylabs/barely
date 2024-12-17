'use client';

import { useModalHotKeys } from '@barely/lib/hooks/use-modal-hot-keys';

import { useTrackContext } from '~/app/[handle]/tracks/_components/track-context';

export function TrackHotkeys() {
	const {
		selection,
		setShowArchiveModal,
		setShowDeleteModal,
		setShowCreateModal,
		setShowUpdateModal,
	} = useTrackContext();

	useModalHotKeys({
		setShowCreateModal,
		setShowUpdateModal,
		setShowArchiveModal,
		setShowDeleteModal,
		itemSelected: selection !== 'all' && !!selection.size,
	});

	return null;
}
