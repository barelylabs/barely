'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { cartApi } from '@barely/lib/server/routes/cart/cart.api.react';

export function useUpsellCart({
	mode,
	// handle,
	// key,
	cartId,
}: {
	mode: 'preview' | 'live';
	handle: string;
	key: string;
	cartId: string;
}) {
	const [converting, setConverting] = useState(false);
	const [declining, setDeclining] = useState(false);

	const router = useRouter();
	const pathname = usePathname();
	const successPath = pathname.replace('/customize', '/success');

	const { mutate: buyUpsell } = cartApi.buyUpsell.useMutation({
		onSuccess: () => {
			router.push(successPath);
		},
	});

	const handleBuyUpsell = () => {
		setConverting(true);
		if (mode === 'preview') {
			return router.push(successPath);
		}
		buyUpsell({ cartId });
	};

	const { mutate: cancelUpsell } = cartApi.declineUpsell.useMutation({
		onSuccess: () => {
			router.push(successPath);
		},
	});

	const handleDeclineUpsell = () => {
		setDeclining(true);
		if (mode === 'preview') {
			return router.push(successPath);
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
