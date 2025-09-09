'use client';

import type { StripeElementsOptions } from '@stripe/stripe-js';
import { useState } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

import { invoiceEnv } from '~/env';

interface ElementsProviderProps {
	clientSecret: string;
	stripeConnectAccountId: string;
	children: React.ReactNode;
}

export function ElementsProvider({
	clientSecret,
	stripeConnectAccountId,
	children,
}: ElementsProviderProps) {
	const options: StripeElementsOptions = {
		clientSecret,
		appearance: {
			theme: 'stripe',
			variables: {
				colorPrimary: '#2563eb',
				colorBackground: '#ffffff',
				colorText: '#1f2937',
				colorTextSecondary: '#6b7280',
				colorTextPlaceholder: '#9ca3af',
				colorDanger: '#dc2626',
				spacingUnit: '4px',
				fontSizeBase: '14px',
				fontFamily: 'Inter, system-ui, sans-serif',
				borderRadius: '6px',
			},
			rules: {
				'.Input': {
					backgroundColor: '#ffffff',
					border: '1px solid #d1d5db',
					boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
				},
				'.Input:focus': {
					borderColor: '#2563eb',
					boxShadow: '0 0 0 3px rgba(37, 99, 235, 0.1)',
				},
				'.Label': {
					color: '#374151',
					fontSize: '14px',
					fontWeight: '500',
				},
			},
		},
		fonts: [
			{
				cssSrc:
					'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap',
			},
		],
		loader: 'always',
	};

	const [stripePromise] = useState(() =>
		loadStripe(invoiceEnv.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, {
			stripeAccount: stripeConnectAccountId,
		}),
	);

	if (!clientSecret) {
		return <div>Loading payment form...</div>;
	}

	return (
		<Elements stripe={stripePromise} options={options}>
			{children}
		</Elements>
	);
}
