'use client';

import { useCallback } from 'react';
import { api } from '@barely/lib/server/api/react';

import { ArchiveOrDeleteModal } from '~/app/[handle]/_components/archive-or-delete-modal';
import { useLandingPageContext } from '~/app/[handle]/pages/_components/landing-page-context';

export function ArchiveOrDeleteLandingPageModal({
	mode,
}: {
	mode: 'archive' | 'delete';
}) {
	const {
		selection,
		lastSelectedItem,
		showArchiveModal,
		showDeleteModal,
		setShowArchiveModal,
		setShowDeleteModal,
	} = useLandingPageContext();

	const apiUtils = api.useUtils();

	const showModal = mode === 'archive' ? showArchiveModal : showDeleteModal;

	const setShowModal = mode === 'archive' ? setShowArchiveModal : setShowDeleteModal;

	const onSuccess = useCallback(async () => {
		await apiUtils.landingPage.invalidate();
		setShowModal(false);
	}, [apiUtils.landingPage, setShowModal]);

	const { mutate: archiveLandingPages, isPending: isPendingArchive } =
		api.landingPage.archive.useMutation({ onSuccess });

	const { mutate: deleteLandingPages, isPending: isPendingDelete } =
		api.landingPage.delete.useMutation({ onSuccess });

	if (!lastSelectedItem) return null;

	return (
		<ArchiveOrDeleteModal
			mode={mode}
			selection={selection}
			lastSelected={lastSelectedItem}
			showModal={showModal}
			setShowModal={setShowModal}
			archiveItems={archiveLandingPages}
			deleteItems={deleteLandingPages}
			isPendingArchive={isPendingArchive}
			isPendingDelete={isPendingDelete}
			itemName='landingPage'
		/>
	);
}
