'use client';

import { useCallback } from 'react';
import { api } from '@barely/lib/server/api/react';

import { ArchiveOrDeleteModal } from '~/app/[handle]/_components/archive-or-delete-modal';
import { useFanGroupContext } from '~/app/[handle]/fan-groups/_components/fan-group-context';

export function ArchiveOrDeleteFanGroupModal({ mode }: { mode: 'archive' | 'delete' }) {
	const {
		selection,
		lastSelectedItem,
		showArchiveModal,
		showDeleteModal,
		setShowArchiveModal,
		setShowDeleteModal,
	} = useFanGroupContext();

	const apiUtils = api.useUtils();

	const showModal = mode === 'archive' ? showArchiveModal : showDeleteModal;

	const setShowModal = mode === 'archive' ? setShowArchiveModal : setShowDeleteModal;

	const onSuccess = useCallback(async () => {
		await apiUtils.fanGroup.invalidate();
		setShowModal(false);
	}, [apiUtils.fanGroup, setShowModal]);

	const { mutate: archiveFanGroups, isPending: isPendingArchive } =
		api.fanGroup.archive.useMutation({ onSuccess });

	const { mutate: deleteFanGroups, isPending: isPendingDelete } =
		api.fanGroup.delete.useMutation({ onSuccess });

	if (!lastSelectedItem) return null;

	return (
		<ArchiveOrDeleteModal
			mode={mode}
			selection={selection}
			lastSelected={{ ...lastSelectedItem, name: lastSelectedItem.name }}
			showModal={showModal}
			setShowModal={setShowModal}
			archiveItems={archiveFanGroups}
			deleteItems={deleteFanGroups}
			isPendingArchive={isPendingArchive}
			isPendingDelete={isPendingDelete}
			itemName='fanGroup'
		/>
	);
}
