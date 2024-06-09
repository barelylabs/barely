'use client';

import { useModalHotKeys } from '@barely/lib/hooks/use-modal-hot-keys';

import { useCartOrderContext } from '~/app/[handle]/orders/_components/cart-order-context';

export function CartOrderHotkeys() {
	const { cartOrderSelection, setShowMarkAsFulfilledModal, lastSelectedCartOrder } =
		useCartOrderContext();

	useModalHotKeys({
		itemSelected: cartOrderSelection !== 'all' && !!cartOrderSelection.size,
		customHotkeys: [
			{
				condition: e => e.key === 'f',
				action: () => {
					if (lastSelectedCartOrder?.fulfillmentStatus !== 'fulfilled') {
						setShowMarkAsFulfilledModal(true);
					}
				},
			},
		],
	});

	return null;
}
