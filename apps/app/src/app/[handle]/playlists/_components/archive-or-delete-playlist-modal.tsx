'use client';

import { useCallback } from 'react';
import { useTRPC } from '@barely/api/app/trpc.react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { ArchiveOrDeleteModal } from '~/app/[handle]/_components/archive-or-delete-modal';
import { usePlaylistContext } from '~/app/[handle]/playlists/_components/playlist-context';

export function ArchiveOrDeletePlaylistModal({ mode }: { mode: 'archive' | 'delete' }) {
	const {
		selection,
		lastSelectedItem,
		showArchiveModal,
		showDeleteModal,
		setShowArchiveModal,
		setShowDeleteModal,
	} = usePlaylistContext();

	const trpc = useTRPC();
	const queryClient = useQueryClient();

	const showModal = mode === 'archive' ? showArchiveModal : showDeleteModal;

	const setShowModal = mode === 'archive' ? setShowArchiveModal : setShowDeleteModal;

	const onSuccess = useCallback(async () => {
		await queryClient.invalidateQueries({
			queryKey: trpc.playlist.byWorkspace.queryKey(),
		});
		setShowModal(false);
	}, [queryClient, trpc.playlist, setShowModal]);

	const { mutate: archivePlaylists, isPending: isPendingArchive } = useMutation(
		trpc.playlist.archive.mutationOptions({ onSuccess }),
	);

	const { mutate: deletePlaylists, isPending: isPendingDelete } = useMutation(
		trpc.playlist.delete.mutationOptions({ onSuccess }),
	);

	if (!lastSelectedItem) return null;

	return (
		<ArchiveOrDeleteModal
			mode={mode}
			selection={selection}
			lastSelected={{ ...lastSelectedItem, name: lastSelectedItem.name }}
			showModal={showModal}
			setShowModal={setShowModal}
			archiveItems={archivePlaylists}
			deleteItems={deletePlaylists}
			isPendingArchive={isPendingArchive}
			isPendingDelete={isPendingDelete}
			itemName='playlist'
		/>
	);
}
