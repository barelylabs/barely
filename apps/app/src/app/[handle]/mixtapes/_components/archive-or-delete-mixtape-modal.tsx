'use client';

import { useCallback } from 'react';
import { useTRPC } from '@barely/api/app/trpc.react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { ArchiveOrDeleteModal } from '~/app/[handle]/_components/archive-or-delete-modal';
import { useMixtapesContext } from '~/app/[handle]/mixtapes/_components/mixtape-context';

export function ArchiveOrDeleteMixtapeModal({ mode }: { mode: 'archive' | 'delete' }) {
	const {
		selection,
		lastSelectedItem,
		showArchiveModal,
		showDeleteModal,
		setShowArchiveModal,
		setShowDeleteModal,
	} = useMixtapesContext();

	const trpc = useTRPC();
	const queryClient = useQueryClient();

	const showModal = mode === 'archive' ? showArchiveModal : showDeleteModal;

	const setShowModal = mode === 'archive' ? setShowArchiveModal : setShowDeleteModal;

	const onSuccess = useCallback(async () => {
		await queryClient.invalidateQueries(trpc.mixtape.byWorkspace.queryFilter());
		setShowModal(false);
	}, [queryClient, trpc.mixtape.byWorkspace, setShowModal]);

	const { mutate: archiveMixtapes, isPending: isPendingArchive } = useMutation(
		trpc.mixtape.archive.mutationOptions({ onSuccess }),
	);

	const { mutate: deleteMixtapes, isPending: isPendingDelete } = useMutation(
		trpc.mixtape.delete.mutationOptions({ onSuccess }),
	);

	if (!lastSelectedItem) return null;

	return (
		<ArchiveOrDeleteModal
			mode={mode}
			selection={selection}
			lastSelected={lastSelectedItem}
			showModal={showModal}
			setShowModal={setShowModal}
			archiveItems={archiveMixtapes}
			deleteItems={deleteMixtapes}
			isPendingArchive={isPendingArchive}
			isPendingDelete={isPendingDelete}
			itemName='mixtape'
		/>
	);
}
