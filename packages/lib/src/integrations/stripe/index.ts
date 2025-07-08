import Stripe from 'stripe';

import { libEnv } from '../../../env';

export const stripe = new Stripe(libEnv.STRIPE_SECRET_KEY, {
	apiVersion: '2023-10-16',
	httpClient: Stripe.createFetchHttpClient(),
});

export function isStripeTestEnvironment() {
	return (
		libEnv.NEXT_PUBLIC_VERCEL_ENV === 'development' ||
		libEnv.NEXT_PUBLIC_VERCEL_ENV === 'preview'
	);
}
