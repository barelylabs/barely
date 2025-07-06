'use client';

import { useModalHotKeys } from '@barely/hooks';

import {
	useProduct,
	useProductSearchParams,
} from '~/app/[handle]/products/_components/product-context';

export function ProductHotkeys() {
	const { selection } = useProduct();
	const {
		setShowCreateModal,
		setShowUpdateModal,
		setShowArchiveModal,
		setShowDeleteModal,
	} = useProductSearchParams();

	useModalHotKeys({
		setShowCreateModal,
		setShowUpdateModal,
		setShowArchiveModal,
		setShowDeleteModal,
		itemSelected: selection !== 'all' && !!selection.size,
	});

	return null;
}
