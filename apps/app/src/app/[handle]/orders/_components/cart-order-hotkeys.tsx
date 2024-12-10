'use client';

import { useCallback } from 'react';
import { useModalHotKeys } from '@barely/lib/hooks/use-modal-hot-keys';

import { useCartOrderContext } from '~/app/[handle]/orders/_components/cart-order-context';

export function CartOrderHotkeys() {
	const {
		cartOrderSelection,
		setShowMarkAsFulfilledModal,
		setShowCancelCartOrderModal,
		lastSelectedCartOrder,
	} = useCartOrderContext();

	const fulfillAction = useCallback(() => {
		if (lastSelectedCartOrder?.fulfillmentStatus === 'fulfilled') {
			return;
		}
		setShowMarkAsFulfilledModal(true);
	}, [lastSelectedCartOrder, setShowMarkAsFulfilledModal]);

	const cancelAction = useCallback(() => {
		if (lastSelectedCartOrder?.canceledAt) {
			return;
		}
		setShowCancelCartOrderModal(true);
	}, [lastSelectedCartOrder, setShowCancelCartOrderModal]);

	useModalHotKeys({
		itemSelected: cartOrderSelection !== 'all' && !!cartOrderSelection.size,
		customHotkeys: [
			{
				condition: e => e.key === 'f' && !e.metaKey && !e.ctrlKey && !e.shiftKey,
				action: fulfillAction,
			},
			{
				condition: e => e.key === 'x' && !e.metaKey && !e.ctrlKey && !e.shiftKey,
				action: cancelAction,
			},
		],
	});

	return null;
}
