'use client';

import { useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useTRPC } from '@barely/api/app/trpc.react';

import { ArchiveOrDeleteModal } from '~/app/[handle]/_components/archive-or-delete-modal';
import {
	useFanGroup,
	useFanGroupSearchParams,
} from '~/app/[handle]/fan-groups/_components/fan-group-context';

export function ArchiveOrDeleteFanGroupModal({ mode }: { mode: 'archive' | 'delete' }) {
	const { selection, lastSelectedItem } = useFanGroup();
	const { showArchiveModal, showDeleteModal, setShowArchiveModal, setShowDeleteModal } =
		useFanGroupSearchParams();

	const trpc = useTRPC();
	const queryClient = useQueryClient();

	const showModal = mode === 'archive' ? showArchiveModal : showDeleteModal;

	const setShowModal = mode === 'archive' ? setShowArchiveModal : setShowDeleteModal;

	const onSuccess = useCallback(async () => {
		await queryClient.invalidateQueries({
			queryKey: trpc.fanGroup.byWorkspace.queryKey(),
		});
		await setShowModal(false);
	}, [queryClient, trpc, setShowModal]);

	const { mutate: archiveFanGroups, isPending: isPendingArchive } = useMutation(
		trpc.fanGroup.archive.mutationOptions({
			onSuccess,
		}),
	);

	const { mutate: deleteFanGroups, isPending: isPendingDelete } = useMutation(
		trpc.fanGroup.delete.mutationOptions({
			onSuccess,
		}),
	);

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
