'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { cartApi } from '@barely/lib/server/routes/cart/cart.api.react';

export function useUpsellCart({ cartId }: { cartId: string }) {
	const [submitting, setSubmitting] = useState(false);

	const router = useRouter();

	const { mutate: buyUpsell } = cartApi.buyUpsell.useMutation({
		onSuccess: res => {
			router.push(`/${res.handle}/${res.funnelKey}/success/${cartId}`);
		},
	});

	const handleBuyUpsell = () => {
		setSubmitting(true);
		buyUpsell({ cartId });
	};

	const { mutate: cancelUpsell } = cartApi.declineUpsell.useMutation({
		onSuccess: res => {
			router.push(`/${res.handle}/${res.funnelKey}/success/${cartId}`);
		},
	});

	const handleDeclineUpsell = () => {
		setSubmitting(true);
		cancelUpsell({ cartId });
	};

	return {
		submitting,
		setSubmitting,
		handleBuyUpsell,
		handleDeclineUpsell,
	};
}
