'use client';

import { useEffect, useRef } from 'react';
import { getAbsoluteUrl, isProduction } from '@barely/utils';

export function WarmupCart() {
	const hasWarmedUp = useRef(false);

	useEffect(() => {
		if (isProduction() && !hasWarmedUp.current) {
			fetch(
				getAbsoluteUrl('cart', `live/warmup/warmup`, {
					// i don't think the handle/key are necessary here
					query: {
						warmup: 'true',
					},
				}),
			).catch(console.error);

			hasWarmedUp.current = true;
		}
	}, []);

	return null;
}
