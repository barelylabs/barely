'use client';

import { useModalHotKeys } from '@barely/hooks';

import { useTrack } from '~/app/[handle]/tracks/_components/track-context';

export function TrackHotkeys() {
	const {
		selection,
		setShowArchiveModal,
		setShowDeleteModal,
		setShowCreateModal,
		setShowUpdateModal,
	} = useTrack();

	useModalHotKeys({
		setShowCreateModal,
		setShowUpdateModal,
		setShowArchiveModal,
		setShowDeleteModal,
		itemSelected: selection !== 'all' && !!selection.size,
	});

	return null;
}
