'use client';

import { useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';

import { useCartTRPC } from '@barely/api/public/cart.trpc.react';

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
	const trpc = useCartTRPC();

	const { mutate: logEvent } = useMutation(trpc.log.mutationOptions());

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
