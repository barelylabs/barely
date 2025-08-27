import Stripe from 'stripe';

import { libEnv } from '../../../env';

export const stripe = new Stripe(libEnv.STRIPE_SECRET_KEY, {
	apiVersion: '2025-07-30.basil',
	httpClient: Stripe.createFetchHttpClient(),
});

export function isStripeTestEnvironment() {
	return (
		libEnv.NEXT_PUBLIC_VERCEL_ENV === 'development' ||
		libEnv.NEXT_PUBLIC_VERCEL_ENV === 'preview'
	);
}
