'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';

import { useCartTRPC } from '@barely/api/public/cart.trpc.react';

import { setCartStageCookie } from '~/app/[mode]/[handle]/[key]/_actions';
import { useCart } from '~/app/[mode]/[handle]/[key]/_components/use-cart';

export function UpsellLog({
	cartId,
	mode,
	handle,
	cartKey,
}: {
	mode: 'preview' | 'live';
	cartId: string;
	handle: string;
	cartKey: string;
}) {
	const trpc = useCartTRPC();
	const router = useRouter();

	const {
		cart: { stage },
	} = useCart({
		id: cartId,
		handle,
		cartKey,
	});

	const { mutate: logEvent } = useMutation(trpc.log.mutationOptions());

	useEffect(() => {
		if (mode === 'preview') return;

		if (
			stage === 'checkoutConverted' ||
			stage === 'upsellConverted' ||
			stage === 'upsellDeclined'
		) {
			return router.push(`/${handle}/${cartKey}/success`);
		}

		setCartStageCookie({
			handle,
			key: cartKey,
			stage: 'upsellCreated',
		}).catch(console.error);

		logEvent({
			cartId,
			event: 'cart/viewUpsell',
		});
	}, [cartId, handle, cartKey, mode, logEvent, stage, router]);

	return null;
}
