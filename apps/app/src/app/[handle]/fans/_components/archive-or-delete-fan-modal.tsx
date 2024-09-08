'use client';

import { useCallback } from 'react';
import { api } from '@barely/lib/server/api/react';

import { ArchiveOrDeleteModal } from '~/app/[handle]/_components/archive-or-delete-modal';
import { useFanContext } from '~/app/[handle]/fans/_components/fan-context';

export function ArchiveOrDeleteFanModal({ mode }: { mode: 'archive' | 'delete' }) {
	const {
		fanSelection,
		lastSelectedFan,
		showArchiveFanModal,
		showDeleteFanModal,
		setShowArchiveFanModal,
		setShowDeleteFanModal,
	} = useFanContext();

	const apiUtils = api.useUtils();

	const showModal = mode === 'archive' ? showArchiveFanModal : showDeleteFanModal;

	const setShowModal =
		mode === 'archive' ? setShowArchiveFanModal : setShowDeleteFanModal;

	const onSuccess = useCallback(async () => {
		await apiUtils.fan.invalidate();
		setShowModal(false);
	}, [apiUtils.fan, setShowModal]);

	const { mutate: archiveFans, isPending: isPendingArchive } =
		api.fan.archive.useMutation({ onSuccess });

	const { mutate: deleteFans, isPending: isPendingDelete } = api.fan.delete.useMutation({
		onSuccess,
	});

	if (!lastSelectedFan) return null;

	return (
		<ArchiveOrDeleteModal
			mode={mode}
			selection={fanSelection}
			lastSelected={{ ...lastSelectedFan, name: lastSelectedFan.fullName }}
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
