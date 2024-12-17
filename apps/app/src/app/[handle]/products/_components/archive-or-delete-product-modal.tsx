'use client';

import { useCallback } from 'react';
import { api } from '@barely/lib/server/api/react';

import { ArchiveOrDeleteModal } from '~/app/[handle]/_components/archive-or-delete-modal';
import { useProductContext } from '~/app/[handle]/products/_components/product-context';

export function ArchiveOrDeleteProductModal({ mode }: { mode: 'archive' | 'delete' }) {
	const {
		selection,
		lastSelectedItem,
		showArchiveModal,
		showDeleteModal,
		setShowArchiveModal,
		setShowDeleteModal,
	} = useProductContext();

	const apiUtils = api.useUtils();

	const showModal = mode === 'archive' ? showArchiveModal : showDeleteModal;

	const setShowModal = mode === 'archive' ? setShowArchiveModal : setShowDeleteModal;

	const onSuccess = useCallback(async () => {
		await apiUtils.product.invalidate();
		setShowModal(false);
	}, [apiUtils.product, setShowModal]);

	const { mutate: archiveProducts, isPending: isPendingArchive } =
		api.product.archive.useMutation({ onSuccess });

	const { mutate: deleteProducts, isPending: isPendingDelete } =
		api.product.delete.useMutation({ onSuccess });

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
