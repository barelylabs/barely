'use client';

import { useEffect } from 'react';
import { cartApi } from '@barely/lib/server/routes/cart/cart.api.react';

export function UpsellLog({ cartId }: { cartId: string }) {
	const { mutate: logEvent } = cartApi.log.useMutation();

	useEffect(() => {
		logEvent({
			cartId,
			event: 'cart/viewUpsell',
		});
	}, [cartId, logEvent]);

	return null;
}
