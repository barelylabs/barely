'use client';

import type { CartRouterOutputs } from '@barely/lib/server/routes/cart/cart.api.react';
import type { InsertCart } from '@barely/lib/server/routes/cart/cart.schema';
import type { StripeElementsOptions } from '@stripe/stripe-js';
import { use, useState } from 'react';
import { isProduction } from '@barely/lib/utils/environment';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

export function ElementsProvider({
	initialData,
	children,
}: {
	stage: InsertCart['stage'];
	initialData: Promise<CartRouterOutputs['create'] | CartRouterOutputs['byIdAndParams']>;
	children: React.ReactNode;
}) {
	const { cart, publicFunnel } = use(initialData);

	const stripeAccount =
		isProduction() ?
			publicFunnel.workspace.stripeConnectAccountId ?? undefined
		:	publicFunnel.workspace.stripeConnectAccountId_devMode ?? undefined;

	const clientSecret = cart.checkoutStripeClientSecret;

	// todo: get these from db, based on handle + funnelKey
	const theme = {
		'--brand': '329 66% 67%',
		'--brand-foreground': '0 0% 100%',
		'--brand-accent': '198 97% 50%',
		'--brand-accent-foreground': '0 0% 100%',
	};

	const options: StripeElementsOptions = {
		clientSecret: clientSecret,
		appearance: {
			theme: 'stripe',
			variables: {
				// colorPrimary: 'hsl(329 66% 67%)',
				colorPrimary: `hsl(${theme['--brand']})`,
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
