'use client';

import { useModalHotKeys } from '@barely/hooks';

import { usePlaylist, usePlaylistSearchParams } from './playlist-context';

export function PlaylistHotkeys() {
	const { selection } = usePlaylist();
	const {
		setShowArchiveModal,
		setShowDeleteModal,
		setShowCreateModal,
		setShowUpdateModal,
	} = usePlaylistSearchParams();

	useModalHotKeys({
		setShowCreateModal,
		setShowUpdateModal,
		setShowArchiveModal,
		setShowDeleteModal,
		itemSelected: selection !== 'all' && !!selection.size,
	});

	return null;
}
