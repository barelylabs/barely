'use client';

import type { CartRouterOutputs } from '@barely/lib/server/routes/cart/cart.api.react';
import type { InsertCart } from '@barely/lib/server/routes/cart/cart.schema';
import type { StripeElementsOptions } from '@stripe/stripe-js';
import { useState } from 'react';
import { isProduction } from '@barely/lib/utils/environment';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

export function ElementsProvider({
	initialData,
	children,
	theme,
}: {
	stage: InsertCart['stage'];
	initialData: CartRouterOutputs['create'] | CartRouterOutputs['byIdAndParams'];
	children: React.ReactNode;
	theme?: {
		colorPrimary?: string;
	};
}) {
	const { cart, publicFunnel } = initialData;

	const stripeAccount =
		isProduction() ?
			publicFunnel.workspace.stripeConnectAccountId ?? undefined
		:	publicFunnel.workspace.stripeConnectAccountId_devMode ?? undefined;

	const clientSecret = cart.checkoutStripeClientSecret;

	const options: StripeElementsOptions = {
		clientSecret: clientSecret,
		appearance: {
			theme: 'stripe',
			variables: {
				colorPrimary: theme?.colorPrimary ?? '',
				colorBackground: '#ffffff',

				spacingUnit: '4px',
				fontSizeBase: '14px',
				fontFamily: 'Inter, sans-serif',
			},
			rules: {
				'.Label': { color: '#ffffff' },
				'.CheckboxLabel': { color: '#ffffff' },
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
		loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? '', {
			stripeAccount,
		}),
	);

	return (
		<Elements stripe={stripePromise} options={options}>
			{children}
		</Elements>
	);
}
