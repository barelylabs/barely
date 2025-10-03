'use client';

import { useEffect } from 'react';

// import { cartApi } from '@barely/lib/server/routes/cart/cart.api.react';

import { setCartStageCookie } from '~/app/[mode]/[handle]/[key]/_actions';

export function SuccessLog({
	handle,
	cartKey,
	currentCartStage,
}: {
	handle: string;
	cartKey: string;
	currentCartStage: string;
}) {
	useEffect(() => {
		if (currentCartStage === 'checkoutCreated') {
			setCartStageCookie({
				handle,
				key: cartKey,
				stage: 'checkoutConverted',
			}).catch(console.error);
		}
	}, [handle, cartKey, currentCartStage]);

	return null;
}
