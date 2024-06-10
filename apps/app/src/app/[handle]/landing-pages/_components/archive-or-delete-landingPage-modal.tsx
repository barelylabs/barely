'use client';

import { useCallback } from 'react';
import { api } from '@barely/lib/server/api/react';

import { ArchiveOrDeleteModal } from '~/app/[handle]/_components/archive-or-delete-modal';
import { useLandingPageContext } from '~/app/[handle]/landing-pages/_components/landing-page-context';

export function ArchiveOrDeleteLandingPageModal({
	mode,
}: {
	mode: 'archive' | 'delete';
}) {
	const {
		landingPageSelection,
		lastSelectedLandingPage,
		showArchiveLandingPageModal,
		showDeleteLandingPageModal,
		setShowArchiveLandingPageModal,
		setShowDeleteLandingPageModal,
	} = useLandingPageContext();

	const apiUtils = api.useUtils();

	const showModal =
		mode === 'archive' ? showArchiveLandingPageModal : showDeleteLandingPageModal;

	const setShowModal =
		mode === 'archive' ? setShowArchiveLandingPageModal : setShowDeleteLandingPageModal;

	const onSuccess = useCallback(async () => {
		await apiUtils.landingPage.invalidate();
		setShowModal(false);
	}, [apiUtils.landingPage, setShowModal]);

	const { mutate: archiveLandingPages, isPending: isPendingArchive } =
		api.landingPage.archive.useMutation({ onSuccess });

	const { mutate: deleteLandingPages, isPending: isPendingDelete } =
		api.landingPage.delete.useMutation({ onSuccess });

	if (!lastSelectedLandingPage) return null;

	return (
		<ArchiveOrDeleteModal
			mode={mode}
			selection={landingPageSelection}
			lastSelected={lastSelectedLandingPage}
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
