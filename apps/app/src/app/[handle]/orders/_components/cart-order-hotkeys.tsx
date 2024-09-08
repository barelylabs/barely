'use client';

import { useCallback } from 'react';
import { useModalHotKeys } from '@barely/lib/hooks/use-modal-hot-keys';

import { useCartOrderContext } from '~/app/[handle]/orders/_components/cart-order-context';

export function CartOrderHotkeys() {
	const { cartOrderSelection, setShowMarkAsFulfilledModal, lastSelectedCartOrder } =
		useCartOrderContext();

	const fulfillAction = useCallback(() => {
		if (lastSelectedCartOrder?.fulfillmentStatus === 'fulfilled') {
			return;
		}
		setShowMarkAsFulfilledModal(true);
	}, [lastSelectedCartOrder, setShowMarkAsFulfilledModal]);

	useModalHotKeys({
		itemSelected: cartOrderSelection !== 'all' && !!cartOrderSelection.size,
		customHotkeys: [
			{
				condition: e => e.key === 'f',
				action: fulfillAction,
			},
		],
	});

	return null;
}
