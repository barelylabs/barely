'use client';

import { useEffect } from 'react';

// import { cartApi } from '@barely/lib/server/routes/cart/cart.api.react';

import { setCartStageCookie } from '~/app/[mode]/[handle]/[key]/_actions';

export function SuccessLog({
	handle,
	key,
	currentCartStage,
}: {
	handle: string;
	key: string;
	currentCartStage: string;
}) {
	useEffect(() => {
		if (currentCartStage === 'checkoutCreated') {
			setCartStageCookie({
				handle,
				key,
				stage: 'checkoutConverted',
			}).catch(console.error);
		}
	}, [handle, key, currentCartStage]);

	return null;
}
