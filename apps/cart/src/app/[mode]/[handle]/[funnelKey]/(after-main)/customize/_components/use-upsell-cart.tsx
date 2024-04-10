'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { cartApi } from '@barely/lib/server/routes/cart/cart.api.react';

export function useUpsellCart({
	mode,
	handle,
	funnelKey,
	cartId,
}: {
	mode: 'preview' | 'live';
	handle: string;
	funnelKey: string;
	cartId: string;
}) {
	const [submitting, setSubmitting] = useState(false);

	const router = useRouter();

	const { mutate: buyUpsell } = cartApi.buyUpsell.useMutation({
		onSuccess: () => {
			router.push(`/${handle}/${funnelKey}/success`);
		},
	});

	const handleBuyUpsell = () => {
		setSubmitting(true);
		if (mode === 'preview') {
			return router.push(`/${handle}/${funnelKey}/success`);
		}
		buyUpsell({ cartId });
	};

	const { mutate: cancelUpsell } = cartApi.declineUpsell.useMutation({
		onSuccess: res => {
			router.push(`/${res.handle}/${res.funnelKey}/success/${cartId}`);
		},
	});

	const handleDeclineUpsell = () => {
		setSubmitting(true);
		if (mode === 'preview') {
			return router.push(`/${handle}/${funnelKey}/success`);
		}
		cancelUpsell({ cartId });
	};

	return {
		submitting,
		setSubmitting,
		handleBuyUpsell,
		handleDeclineUpsell,
	};
}
