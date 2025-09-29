'use client';

import { useModalHotKeys } from '@barely/hooks';

import {
	useCartFunnel,
	useCartFunnelSearchParams,
} from '~/app/[handle]/merch/carts/_components/cartFunnel-context';

export function CartFunnelHotkeys() {
	const { selection: cartFunnelSelection } = useCartFunnel();
	const {
		setShowCreateModal: setShowCreateCartFunnelModal,
		setShowUpdateModal: setShowUpdateCartFunnelModal,
		setShowArchiveModal: setShowArchiveCartFunnelModal,
		setShowDeleteModal: setShowDeleteCartFunnelModal,
	} = useCartFunnelSearchParams();

	useModalHotKeys({
		setShowCreateModal: setShowCreateCartFunnelModal,
		setShowUpdateModal: setShowUpdateCartFunnelModal,
		setShowArchiveModal: setShowArchiveCartFunnelModal,
		setShowDeleteModal: setShowDeleteCartFunnelModal,
		itemSelected: cartFunnelSelection !== 'all' && !!cartFunnelSelection.size,
	});
	return null;
}
