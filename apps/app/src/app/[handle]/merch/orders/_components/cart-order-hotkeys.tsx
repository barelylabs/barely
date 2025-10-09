'use client';

import { useCallback } from 'react';
import { useModalHotKeys } from '@barely/hooks';

import { useCartOrder } from '~/app/[handle]/merch/orders/_components/cart-order-context';

export function CartOrderHotkeys() {
	const {
		selection,
		lastSelectedItem,
		setShowMarkAsFulfilledModal,
		setShowCancelCartOrderModal,
		setShowShipOrderModal,
	} = useCartOrder();

	const fulfillAction = useCallback(async () => {
		if (!lastSelectedItem || lastSelectedItem.fulfillmentStatus === 'fulfilled') {
			return;
		}
		await setShowMarkAsFulfilledModal(true);
	}, [lastSelectedItem, setShowMarkAsFulfilledModal]);

	const cancelAction = useCallback(async () => {
		if (
			!lastSelectedItem ||
			!!lastSelectedItem.canceledAt ||
			lastSelectedItem.fulfillmentStatus !== 'pending'
		) {
			return;
		}
		await setShowCancelCartOrderModal(true);
	}, [lastSelectedItem, setShowCancelCartOrderModal]);

	const shipAction = useCallback(async () => {
		if (
			!lastSelectedItem ||
			!!lastSelectedItem.canceledAt ||
			lastSelectedItem.fulfillmentStatus !== 'pending'
		) {
			return;
		}
		await setShowShipOrderModal(true);
	}, [lastSelectedItem, setShowShipOrderModal]);

	useModalHotKeys({
		itemSelected: selection !== 'all' && !!selection.size,
		customHotkeys: [
			{
				condition: e => e.key === 's' && !e.metaKey && !e.ctrlKey && !e.shiftKey,
				action: shipAction,
			},
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
