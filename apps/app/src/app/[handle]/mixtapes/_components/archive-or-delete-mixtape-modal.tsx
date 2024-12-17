'use client';

import { useCallback } from 'react';
import { api } from '@barely/lib/server/api/react';

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

	const apiUtils = api.useUtils();

	const showModal = mode === 'archive' ? showArchiveModal : showDeleteModal;

	const setShowModal = mode === 'archive' ? setShowArchiveModal : setShowDeleteModal;

	const onSuccess = useCallback(async () => {
		await apiUtils.mixtape.invalidate();
		setShowModal(false);
	}, [apiUtils.mixtape, setShowModal]);

	const { mutate: archiveMixtapes, isPending: isPendingArchive } =
		api.mixtape.archive.useMutation({ onSuccess });

	const { mutate: deleteMixtapes, isPending: isPendingDelete } =
		api.mixtape.delete.useMutation({ onSuccess });

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
