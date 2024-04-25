'use client';

import { useModalHotKeys } from '@barely/lib/hooks/use-modal-hot-keys';

import { useCartFunnelContext } from '~/app/[handle]/carts/_components/cart-funnel-context';

export function CartFunnelHotkeys() {
	const {
		cartFunnelSelection,
		setShowCreateCartFunnelModal,
		setShowUpdateCartFunnelModal,
		setShowArchiveCartFunnelModal,
		setShowDeleteCartFunnelModal,
	} = useCartFunnelContext();

	useModalHotKeys({
		setShowCreateModal: setShowCreateCartFunnelModal,
		setShowUpdateModal: setShowUpdateCartFunnelModal,
		setShowArchiveModal: setShowArchiveCartFunnelModal,
		setShowDeleteModal: setShowDeleteCartFunnelModal,
		itemSelected: cartFunnelSelection !== 'all' && !!cartFunnelSelection.size,
	});
	return null;
}
