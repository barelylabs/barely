'use client';

import { useCallback } from 'react';
import { useWorkspace } from '@barely/hooks';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useTRPC } from '@barely/api/app/trpc.react';

import { ArchiveOrDeleteModal } from '~/app/[handle]/_components/archive-or-delete-modal';
import { useFan, useFanSearchParams } from '~/app/[handle]/fans/_components/fan-context';

export function ArchiveOrDeleteFanModal({ mode }: { mode: 'archive' | 'delete' }) {
	const { selection, lastSelectedItem } = useFan();
	const { showArchiveModal, showDeleteModal, setShowArchiveModal, setShowDeleteModal } =
		useFanSearchParams();

	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const { handle } = useWorkspace();

	const showModal = mode === 'archive' ? showArchiveModal : showDeleteModal;

	const setShowModal = mode === 'archive' ? setShowArchiveModal : setShowDeleteModal;

	const onSuccess = useCallback(async () => {
		await queryClient.invalidateQueries(trpc.fan.byWorkspace.queryFilter({ handle }));
		await setShowModal(false);
	}, [queryClient, trpc, setShowModal, handle]);

	const { mutate: archiveFans, isPending: isPendingArchive } = useMutation({
		...trpc.fan.archive.mutationOptions(),
		onSuccess,
	});

	const { mutate: deleteFans, isPending: isPendingDelete } = useMutation({
		...trpc.fan.delete.mutationOptions(),
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
