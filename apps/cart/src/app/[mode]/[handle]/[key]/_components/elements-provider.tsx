'use client';

import type { InsertCart } from '@barely/validators';
import type { StripeElementsOptions } from '@stripe/stripe-js';
import { useState } from 'react';
import { getComputedStyles, isProduction, oklchToHex } from '@barely/utils';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

import { useBrandKit } from '@barely/ui/src/bio';

import { cartEnv } from '~/env';
import { useCart } from './use-cart';
import { usePublicFunnel } from './use-public-funnel';

export function ElementsProvider({
	// stage,
	cartId,
	handle,
	cartKey,
	children,
}: {
	stage: InsertCart['stage'];
	cartId: string;
	handle: string;
	cartKey: string;

	children: React.ReactNode;
}) {
	const brandKit = useBrandKit();
	const computedStyles = getComputedStyles(brandKit, 'cart');

	const { cart } = useCart({ id: cartId, handle, key: cartKey });
	const { publicFunnel } = usePublicFunnel({ handle, key: cartKey });

	const stripeAccount =
		isProduction() ?
			(publicFunnel.workspace.stripeConnectAccountId ?? undefined)
		:	(publicFunnel.workspace.stripeConnectAccountId_devMode ?? undefined);

	const clientSecret = cart.checkoutStripeClientSecret;

	const options: StripeElementsOptions = {
		clientSecret: clientSecret,
		appearance: {
			theme: 'stripe',
			variables: {
				colorBackground: '#ffffff',
				colorPrimary: oklchToHex(computedStyles.colors.block),
				colorTextSecondary: oklchToHex(computedStyles.colors.text),
				colorDanger: oklchToHex(computedStyles.colors.block),
				spacingUnit: '4px',
				fontSizeBase: '14px',
				fontFamily: 'Inter, sans-serif',
			},
			rules: {
				'.Label': { color: oklchToHex(computedStyles.colors.text) },
				'.CheckboxLabel': { color: oklchToHex(computedStyles.colors.text) },
			},
		},
		fonts: [
			{
				cssSrc: 'https://fonts.googleapis.com/css?family=Inter',
			},
		],
		loader: 'always',
	};

	const [stripePromise] = useState(() =>
		loadStripe(cartEnv.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, {
			stripeAccount,
		}),
	);

	return (
		<Elements stripe={stripePromise} options={options}>
			{children}
		</Elements>
	);
}
