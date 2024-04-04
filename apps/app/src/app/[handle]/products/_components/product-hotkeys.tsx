'use client';

import { useModalHotKeys } from '@barely/lib/hooks/use-modal-hot-keys';

import { useProductContext } from '~/app/[handle]/products/_components/product-context';

export function ProductHotkeys() {
	const {
		productSelection,
		setShowCreateProductModal,
		setShowUpdateProductModal,
		setShowArchiveProductModal,
		setShowDeleteProductModal,
	} = useProductContext();

	useModalHotKeys({
		setShowCreateModal: setShowCreateProductModal,
		setShowUpdateModal: setShowUpdateProductModal,
		setShowArchiveModal: setShowArchiveProductModal,
		setShowDeleteModal: setShowDeleteProductModal,
		itemSelected: productSelection !== 'all' && !!productSelection.size,
	});

	return null;
}
