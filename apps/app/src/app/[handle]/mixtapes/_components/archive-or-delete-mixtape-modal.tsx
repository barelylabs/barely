'use client';

import { useCallback } from 'react';
import { api } from '@barely/lib/server/api/react';

import { ArchiveOrDeleteModal } from '~/app/[handle]/_components/archive-or-delete-modal';
import { useMixtapesContext } from '~/app/[handle]/mixtapes/_components/mixtape-context';

export function ArchiveOrDeleteMixtapeModal({ mode }: { mode: 'archive' | 'delete' }) {
	const {
		mixtapeSelection,
		lastSelectedMixtape,
		showArchiveMixtapeModal,
		showDeleteMixtapeModal,
		setShowArchiveMixtapeModal,
		setShowDeleteMixtapeModal,
	} = useMixtapesContext();

	const apiUtils = api.useUtils();

	const showModal = mode === 'archive' ? showArchiveMixtapeModal : showDeleteMixtapeModal;

	const setShowModal =
		mode === 'archive' ? setShowArchiveMixtapeModal : setShowDeleteMixtapeModal;

	const onSuccess = useCallback(async () => {
		await apiUtils.mixtape.invalidate();
		setShowModal(false);
	}, [apiUtils.mixtape, setShowModal]);

	const { mutate: archiveMixtapes, isPending: isPendingArchive } =
		api.mixtape.archive.useMutation({ onSuccess });

	const { mutate: deleteMixtapes, isPending: isPendingDelete } =
		api.mixtape.delete.useMutation({ onSuccess });

	if (!lastSelectedMixtape) return null;

	return (
		<ArchiveOrDeleteModal
			mode={mode}
			selection={mixtapeSelection}
			lastSelected={lastSelectedMixtape}
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
