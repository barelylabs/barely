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
	const [converting, setConverting] = useState(false);
	const [declining, setDeclining] = useState(false);

	const router = useRouter();
	const pathname = usePathname();

	const { mutate: buyUpsell } = cartApi.buyUpsell.useMutation({
		onSuccess: () => {
			router.push(`/${handle}/${funnelKey}/success`);
		},
	});

	const handleBuyUpsell = () => {
		setConverting(true);
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
		setDeclining(true);
		if (mode === 'preview') {
			return router.push(pathname.replace('/customize', '/success'));
		}
		cancelUpsell({ cartId });
	};

	return {
		submitting: converting || declining,
		converting,
		declining,
		handleBuyUpsell,
		handleDeclineUpsell,
	};
}
