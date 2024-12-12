'use client';

import { useEffect } from 'react';
import { cartApi } from '@barely/lib/server/routes/cart/cart.api.react';

import { setCartStageCookie } from '~/app/[mode]/[handle]/[key]/_actions';

export function UpsellLog({
	cartId,
	handle,
	key,
}: {
	cartId: string;
	handle: string;
	key: string;
}) {
	const { mutate: logEvent } = cartApi.log.useMutation();

	useEffect(() => {
		setCartStageCookie({
			handle,
			key,
			stage: 'upsellCreated',
		}).catch(console.error);

		logEvent({
			cartId,
			event: 'cart/viewUpsell',
		});
	}, [cartId, handle, key, logEvent]);

	return null;
}
