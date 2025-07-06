'use client';

import { useCallback } from 'react';
import { useModalHotKeys } from '@barely/hooks';

import { useCartOrder } from '~/app/[handle]/orders/_components/cart-order-context';

export function CartOrderHotkeys() {
	const { selection, lastSelectedItem, setShowMarkAsFulfilledModal, setShowCancelCartOrderModal } = useCartOrder();

	const fulfillAction = useCallback(() => {
		if (!lastSelectedItem || lastSelectedItem.fulfillmentStatus === 'fulfilled') {
			return;
		}
		setShowMarkAsFulfilledModal(true);
	}, [lastSelectedItem, setShowMarkAsFulfilledModal]);

	const cancelAction = useCallback(() => {
		if (
			!lastSelectedItem ||
			!!lastSelectedItem.canceledAt ||
			lastSelectedItem.fulfillmentStatus !== 'pending'
		) {
			return;
		}
		setShowCancelCartOrderModal(true);
	}, [lastSelectedItem, setShowCancelCartOrderModal]);

	useModalHotKeys({
		itemSelected: selection !== 'all' && !!selection.size,
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
