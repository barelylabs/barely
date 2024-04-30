'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
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
	const pathname = usePathname();

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
			router.push(`/${res.handle}/${res.funnelKey}/success`);
		},
	});

	const handleDeclineUpsell = () => {
		setSubmitting(true);
		if (mode === 'preview') {
			return router.push(pathname.replace('/customize', '/success'));
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
