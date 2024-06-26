'use client';

import { useCallback } from 'react';
import { api } from '@barely/lib/server/api/react';

import { ArchiveOrDeleteModal } from '~/app/[handle]/_components/archive-or-delete-modal';
import { useFmContext } from '~/app/[handle]/fm/_components/fm-context';

export function ArchiveOrDeleteFmModal({ mode }: { mode: 'archive' | 'delete' }) {
	const {
		fmPageSelection,
		lastSelectedFmPage,
		showArchiveFmPageModal,
		showDeleteFmPageModal,
		setShowArchiveFmPageModal,
		setShowDeleteFmPageModal,
	} = useFmContext();

	const apiUtils = api.useUtils();

	const showModal = mode === 'archive' ? showArchiveFmPageModal : showDeleteFmPageModal;

	const setShowModal =
		mode === 'archive' ? setShowArchiveFmPageModal : setShowDeleteFmPageModal;

	const onSuccess = useCallback(async () => {
		await apiUtils.fm.invalidate();
		setShowModal(false);
	}, [apiUtils.fm, setShowModal]);

	const { mutate: archiveFmPages, isPending: isPendingArchive } =
		api.fm.archive.useMutation({ onSuccess });

	const { mutate: deleteFmPages, isPending: isPendingDelete } = api.fm.delete.useMutation(
		{ onSuccess },
	);

	if (!lastSelectedFmPage) return null;

	return (
		<ArchiveOrDeleteModal
			mode={mode}
			selection={fmPageSelection}
			lastSelected={{ ...lastSelectedFmPage, name: lastSelectedFmPage.title }}
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
