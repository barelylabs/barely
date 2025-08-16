'use client';

import { useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useTRPC } from '@barely/api/app/trpc.react';

import { ArchiveOrDeleteModal } from '~/app/[handle]/_components/archive-or-delete-modal';
import {
	useProduct,
	useProductSearchParams,
} from '~/app/[handle]/products/_components/product-context';

export function ArchiveOrDeleteProductModal({ mode }: { mode: 'archive' | 'delete' }) {
	const trpc = useTRPC();
	const queryClient = useQueryClient();

	const { selection, lastSelectedItem } = useProduct();

	const { showArchiveModal, showDeleteModal, setShowArchiveModal, setShowDeleteModal } =
		useProductSearchParams();

	const showModal = mode === 'archive' ? showArchiveModal : showDeleteModal;

	const setShowModal = mode === 'archive' ? setShowArchiveModal : setShowDeleteModal;

	const onSuccess = useCallback(async () => {
		await queryClient.invalidateQueries({
			queryKey: trpc.product.byWorkspace.queryKey(),
		});
		await setShowModal(false);
	}, [queryClient, setShowModal, trpc.product.byWorkspace]);

	const { mutate: archiveProducts, isPending: isPendingArchive } = useMutation(
		trpc.product.archive.mutationOptions({
			onSuccess,
		}),
	);

	const { mutate: deleteProducts, isPending: isPendingDelete } = useMutation(
		trpc.product.delete.mutationOptions({
			onSuccess,
		}),
	);

	if (!lastSelectedItem) return null;

	return (
		<ArchiveOrDeleteModal
			mode={mode}
			selection={selection}
			lastSelected={lastSelectedItem}
			showModal={showModal}
			setShowModal={setShowModal}
			archiveItems={archiveProducts}
			deleteItems={deleteProducts}
			isPendingArchive={isPendingArchive}
			isPendingDelete={isPendingDelete}
			itemName='product'
		/>
	);
}
