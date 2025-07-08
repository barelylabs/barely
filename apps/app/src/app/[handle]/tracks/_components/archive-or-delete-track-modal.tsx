'use client';

import { useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useTRPC } from '@barely/api/app/trpc.react';

import { ArchiveOrDeleteModal } from '~/app/[handle]/_components/archive-or-delete-modal';
import { useTrack } from '~/app/[handle]/tracks/_components/track-context';

export function ArchiveOrDeleteTrackModal({ mode }: { mode: 'archive' | 'delete' }) {
	const trpc = useTRPC();
	const queryClient = useQueryClient();

	const {
		selection,
		lastSelectedItem,
		showArchiveModal,
		showDeleteModal,
		setShowArchiveModal,
		setShowDeleteModal,
	} = useTrack();

	const showModal = mode === 'archive' ? showArchiveModal : showDeleteModal;

	const setShowModal = mode === 'archive' ? setShowArchiveModal : setShowDeleteModal;

	const onSuccess = useCallback(async () => {
		await queryClient.invalidateQueries(trpc.track.byWorkspace.queryFilter());
		await setShowModal(false);
	}, [queryClient, setShowModal, trpc.track.byWorkspace]);

	const { mutate: archiveTracks, isPending: isPendingArchive } = useMutation({
		...trpc.track.archive.mutationOptions(),
		onSuccess,
	});

	const { mutate: deleteTracks, isPending: isPendingDelete } = useMutation({
		...trpc.track.delete.mutationOptions(),
		onSuccess,
	});

	if (!lastSelectedItem) return null;

	return (
		<ArchiveOrDeleteModal
			mode={mode}
			selection={selection}
			lastSelected={lastSelectedItem}
			showModal={showModal}
			setShowModal={setShowModal}
			archiveItems={archiveTracks}
			deleteItems={deleteTracks}
			isPendingArchive={isPendingArchive}
			isPendingDelete={isPendingDelete}
			itemName='track'
		/>
	);
}
