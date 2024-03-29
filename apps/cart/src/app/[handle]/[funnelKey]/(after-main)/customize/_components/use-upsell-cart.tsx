'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@barely/lib/server/api/react';

export function useUpsellCart({ cartId }: { cartId: string }) {
	const [submitting, setSubmitting] = useState(false);

	const router = useRouter();

	const { mutate: buyUpsell } = api.cart.buyUpsell.useMutation({
		onSuccess: res => {
			router.push(`/${res.handle}/${res.funnelKey}/success/${cartId}`);
		},
	});

	const handleBuyUpsell = () => {
		setSubmitting(true);
		buyUpsell({ cartId });
	};

	const { mutate: cancelUpsell } = api.cart.declineUpsell.useMutation({
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
