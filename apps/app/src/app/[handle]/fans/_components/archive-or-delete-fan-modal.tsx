'use client';

import { useCallback } from 'react';
import { api } from '@barely/lib/server/api/react';

import { ArchiveOrDeleteModal } from '~/app/[handle]/_components/archive-or-delete-modal';
import { useFanContext } from '~/app/[handle]/fans/_components/fan-context';

export function ArchiveOrDeleteFanModal({ mode }: { mode: 'archive' | 'delete' }) {
	const {
		selection,
		lastSelectedItem,
		showArchiveModal,
		showDeleteModal,
		setShowArchiveModal,
		setShowDeleteModal,
	} = useFanContext();

	const apiUtils = api.useUtils();

	const showModal = mode === 'archive' ? showArchiveModal : showDeleteModal;

	const setShowModal = mode === 'archive' ? setShowArchiveModal : setShowDeleteModal;

	const onSuccess = useCallback(async () => {
		await apiUtils.fan.invalidate();
		setShowModal(false);
	}, [apiUtils.fan, setShowModal]);

	const { mutate: archiveFans, isPending: isPendingArchive } =
		api.fan.archive.useMutation({ onSuccess });

	const { mutate: deleteFans, isPending: isPendingDelete } = api.fan.delete.useMutation({
		onSuccess,
	});

	if (!lastSelectedItem) return null;

	return (
		<ArchiveOrDeleteModal
			mode={mode}
			selection={selection}
			lastSelected={{ ...lastSelectedItem, name: lastSelectedItem.fullName }}
			showModal={showModal}
			setShowModal={setShowModal}
			archiveItems={archiveFans}
			deleteItems={deleteFans}
			isPendingArchive={isPendingArchive}
			isPendingDelete={isPendingDelete}
			itemName='fan'
		/>
	);
}
