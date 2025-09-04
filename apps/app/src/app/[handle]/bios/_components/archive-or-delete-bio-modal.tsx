'use client';

import { useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useTRPC } from '@barely/api/app/trpc.react';

import { Modal, ModalBody, ModalHeader } from '@barely/ui/modal';

import { ArchiveOrDeleteModal } from '~/app/[handle]/_components/archive-or-delete-modal';
import {
	useBios,
	useBiosSearchParams,
} from '~/app/[handle]/bios/_components/bio-context';

export function ArchiveOrDeleteBioModal({ mode }: { mode: 'archive' | 'delete' }) {
	const { selection, lastSelectedItem } = useBios();
	const { showArchiveModal, showDeleteModal, setShowArchiveModal, setShowDeleteModal } =
		useBiosSearchParams();

	const trpc = useTRPC();
	const queryClient = useQueryClient();

	const showModal = mode === 'archive' ? showArchiveModal : showDeleteModal;

	const setShowModal = mode === 'archive' ? setShowArchiveModal : setShowDeleteModal;

	const onSuccess = useCallback(async () => {
		await queryClient.invalidateQueries({
			queryKey: trpc.bio.byWorkspace.queryKey(),
		});
		await setShowModal(false);
	}, [queryClient, trpc.bio, setShowModal]);

	const { mutate: archiveBios, isPending: isPendingArchive } = useMutation(
		trpc.bio.archiveBio.mutationOptions({ onSuccess }),
	);

	const { mutate: deleteBios, isPending: isPendingDelete } = useMutation(
		trpc.bio.deleteBio.mutationOptions({ onSuccess }),
	);

	if (!lastSelectedItem) return null;

	// Prevent archiving/deleting the home bio
	if (lastSelectedItem.key === 'home') {
		return (
			<Modal showModal={showModal} setShowModal={setShowModal}>
				<ModalHeader
					icon='bio'
					title='Bio'
					subtitle='The home bio page cannot be archived or deleted.'
				/>
				<ModalBody>You can't delete the home bio page.</ModalBody>
			</Modal>
		);
	}

	return (
		<ArchiveOrDeleteModal
			mode={mode}
			selection={selection}
			lastSelected={{ ...lastSelectedItem, name: lastSelectedItem.key }}
			showModal={showModal}
			setShowModal={setShowModal}
			archiveItems={archiveBios}
			deleteItems={deleteBios}
			isPendingArchive={isPendingArchive}
			isPendingDelete={isPendingDelete}
			itemName='bio'
		/>
	);
}
