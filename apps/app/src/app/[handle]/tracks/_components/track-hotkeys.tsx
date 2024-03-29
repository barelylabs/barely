'use client';

import { useModalHotKeys } from '@barely/lib/hooks/use-modal-hot-keys';

import { useTrackContext } from '~/app/[handle]/tracks/_components/track-context';

export function TrackHotkeys() {
	const {
		trackSelection,
		setShowArchiveTrackModal,
		setShowDeleteTrackModal,
		setShowCreateTrackModal,
		setShowEditTrackModal,
	} = useTrackContext();

	useModalHotKeys({
		setShowCreateModal: setShowCreateTrackModal,
		setShowUpdateModal: setShowEditTrackModal,
		setShowArchiveModal: setShowArchiveTrackModal,
		setShowDeleteModal: setShowDeleteTrackModal,
		itemSelected: trackSelection !== 'all' && !!trackSelection.size,
	});

	return null;
}
