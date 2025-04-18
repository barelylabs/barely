'use client';

import { useCallback } from 'react';
import { api } from '@barely/lib/server/api/react';

import { ArchiveOrDeleteModal } from '~/app/[handle]/_components/archive-or-delete-modal';
import { useLinkContext } from '~/app/[handle]/links/_components/link-context';

export function ArchiveOrDeleteLinkModal({ mode }: { mode: 'archive' | 'delete' }) {
	const {
		selection: linkSelection,
		lastSelectedItem: lastSelectedLink,
		showArchiveModal,
		showDeleteModal,
		setShowArchiveModal,
		setShowDeleteModal,
	} = useLinkContext();

	const apiUtils = api.useUtils();

	const showModal = mode === 'archive' ? showArchiveModal : showDeleteModal;

	const setShowModal = mode === 'archive' ? setShowArchiveModal : setShowDeleteModal;

	const onSuccess = useCallback(async () => {
		await apiUtils.link.invalidate();
		setShowModal(false);
	}, [apiUtils.link, setShowModal]);

	const { mutate: archiveLinks, isPending: isPendingArchive } =
		api.link.archive.useMutation({ onSuccess });

	const { mutate: deleteLinks, isPending: isPendingDelete } = api.link.delete.useMutation(
		{ onSuccess },
	);

	if (!lastSelectedLink) return null;

	return (
		<ArchiveOrDeleteModal
			mode={mode}
			selection={linkSelection}
			lastSelected={{ ...lastSelectedLink, name: lastSelectedLink.key }}
			showModal={showModal}
			setShowModal={setShowModal}
			archiveItems={archiveLinks}
			deleteItems={deleteLinks}
			isPendingArchive={isPendingArchive}
			isPendingDelete={isPendingDelete}
			itemName='link'
		/>
	);
}
