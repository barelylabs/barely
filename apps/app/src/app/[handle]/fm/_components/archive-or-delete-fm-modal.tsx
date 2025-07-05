'use client';

import { useCallback } from 'react';
import { useTRPC } from '@barely/api/app/trpc.react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { ArchiveOrDeleteModal } from '~/app/[handle]/_components/archive-or-delete-modal';
import { useFmContext } from '~/app/[handle]/fm/_components/fm-context';

export function ArchiveOrDeleteFmModal({ mode }: { mode: 'archive' | 'delete' }) {
	const {
		selection,
		lastSelectedItem,
		showArchiveModal,
		showDeleteModal,
		setShowArchiveModal,
		setShowDeleteModal,
	} = useFmContext();

	const trpc = useTRPC();
	const queryClient = useQueryClient();

	const showModal = mode === 'archive' ? showArchiveModal : showDeleteModal;

	const setShowModal = mode === 'archive' ? setShowArchiveModal : setShowDeleteModal;

	const onSuccess = useCallback(async () => {
		await queryClient.invalidateQueries({
			queryKey: trpc.fm.byWorkspace.queryKey(),
		});
		setShowModal(false);
	}, [queryClient, trpc.fm, setShowModal]);

	const { mutate: archiveFmPages, isPending: isPendingArchive } = useMutation(
		trpc.fm.archive.mutationOptions({ onSuccess }),
	);

	const { mutate: deleteFmPages, isPending: isPendingDelete } = useMutation(
		trpc.fm.delete.mutationOptions({ onSuccess }),
	);

	if (!lastSelectedItem) return null;

	return (
		<ArchiveOrDeleteModal
			mode={mode}
			selection={selection}
			lastSelected={{ ...lastSelectedItem, name: lastSelectedItem.title }}
			showModal={showModal}
			setShowModal={setShowModal}
			archiveItems={archiveFmPages}
			deleteItems={deleteFmPages}
			isPendingArchive={isPendingArchive}
			isPendingDelete={isPendingDelete}
			itemName='fm'
		/>
	);
}
