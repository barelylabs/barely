'use client';

import { useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useTRPC } from '@barely/api/app/trpc.react';

import { ArchiveOrDeleteModal } from '~/app/[handle]/_components/archive-or-delete-modal';
import { useVipSwaps, useVipSwapsSearchParams } from './use-vip-swaps';

export function ArchiveOrDeleteVipSwapModal({ mode }: { mode: 'archive' | 'delete' }) {
	const { selection, lastSelectedItem } = useVipSwaps();
	const { showArchiveModal, showDeleteModal, setShowArchiveModal, setShowDeleteModal } =
		useVipSwapsSearchParams();

	const trpc = useTRPC();
	const queryClient = useQueryClient();

	const showModal = mode === 'archive' ? showArchiveModal : showDeleteModal;

	const setShowModal = mode === 'archive' ? setShowArchiveModal : setShowDeleteModal;

	const onSuccess = useCallback(async () => {
		await queryClient.invalidateQueries({
			queryKey: trpc.vipSwap.byWorkspace.queryKey(),
		});
		await setShowModal(false);
	}, [queryClient, trpc.vipSwap, setShowModal]);

	const { mutate: archiveVipSwaps, isPending: isPendingArchive } = useMutation(
		trpc.vipSwap.archive.mutationOptions({ onSuccess }),
	);

	const { mutate: deleteVipSwaps, isPending: isPendingDelete } = useMutation(
		trpc.vipSwap.delete.mutationOptions({ onSuccess }),
	);

	if (!lastSelectedItem) return null;

	return (
		<ArchiveOrDeleteModal
			mode={mode}
			selection={selection}
			lastSelected={lastSelectedItem}
			showModal={showModal}
			setShowModal={setShowModal}
			archiveItems={archiveVipSwaps}
			deleteItems={deleteVipSwaps}
			isPendingArchive={isPendingArchive}
			isPendingDelete={isPendingDelete}
			itemName='vipSwap'
		/>
	);
}
