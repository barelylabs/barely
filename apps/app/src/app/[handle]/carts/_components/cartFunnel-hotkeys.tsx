'use client';

import { useModalHotKeys } from '@barely/hooks';

import { useCartFunnelContext } from '~/app/[handle]/carts/_components/cartFunnel-context';

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
