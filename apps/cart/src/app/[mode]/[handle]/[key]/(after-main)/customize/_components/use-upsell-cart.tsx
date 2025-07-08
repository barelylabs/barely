'use client';

import type { ApparelSize } from '@barely/const';
import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';

import { useCartTRPC } from '@barely/api/public/cart.trpc.react';

export function useUpsellCart({
	mode,
	cartId,
	apparelSize,
}: {
	mode: 'preview' | 'live';
	cartId: string;
	apparelSize?: ApparelSize;
	handle: string;
	key: string;
}) {
	const trpc = useCartTRPC();
	const [converting, setConverting] = useState(false);
	const [declining, setDeclining] = useState(false);

	const router = useRouter();
	const pathname = usePathname();
	const successPath = pathname.replace('/customize', '/success');

	const { mutate: buyUpsell } = useMutation(
		trpc.buyUpsell.mutationOptions({
			onSuccess: () => {
				router.push(successPath);
			},
		}),
	);

	const handleBuyUpsell = () => {
		setConverting(true);
		if (mode === 'preview') {
			return router.push(successPath);
		}
		buyUpsell({ cartId, apparelSize });
	};

	const { mutate: cancelUpsell } = useMutation(
		trpc.declineUpsell.mutationOptions({
			onSuccess: () => {
				router.push(successPath);
			},
		}),
	);

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
