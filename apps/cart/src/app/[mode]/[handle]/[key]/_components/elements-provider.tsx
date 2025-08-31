'use client';

import type { InsertCart } from '@barely/validators';
import type { StripeElementsOptions } from '@stripe/stripe-js';
import { useState } from 'react';
import {
	getComputedStyles,
	isProduction,
	modifyOklch,
	oklchToHex,
	oklchToRgba,
} from '@barely/utils';
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
				// colorBackground: '#ffffff',
				colorPrimary: oklchToHex(computedStyles.colors.block),
				colorPrimaryText: '#000000',
				colorText: oklchToHex(computedStyles.colors.text),
				// Use rgba for colors that need transparency
				colorTextSecondary: oklchToRgba(
					modifyOklch(computedStyles.colors.text, { alpha: 0.7 }),
				),
				colorTextPlaceholder: 'rgba(0, 0, 0, 0.7)',
				colorDanger: oklchToHex(computedStyles.colors.block),
				spacingUnit: '4px',
				fontSizeBase: '14px',
				fontFamily: 'Inter, sans-serif',
			},
			rules: {
				// '.Input': {
				// 	backgroundColor: '#ffffff',
				// },
				// Use rgba for label colors with transparency
				'.Dropdown': {
					backgroundColor: '#ffffff',
					color: '#000000',
				},
				'.DropdownItem': {
					color: '#000000',
				},
				'.MenuAction': {
					color: '#000000',
				},
				'.Input': {
					backgroundColor: '#ffffff',
					color: '#000000',
				},
				'.Label': {
					color: oklchToRgba(modifyOklch(computedStyles.colors.text, { alpha: 0.7 })),
				},
				'.Checkbox': {
					color: oklchToHex(computedStyles.colors.text),
				},
				'.CheckboxLabel': {
					color: oklchToRgba(modifyOklch(computedStyles.colors.text, { alpha: 0.7 })),
				},
			},
		},
		fonts: [
			{
				cssSrc: 'https://fonts.googleapis.com/css?family=Inter',
			},
		],
		loader: 'always',
	};

	console.log(oklchToHex(computedStyles.colors.text));

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
