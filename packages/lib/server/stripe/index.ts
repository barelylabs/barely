import Stripe from 'stripe';

import { env } from '../../env';

export const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
	apiVersion: '2023-10-16',
	httpClient: Stripe.createFetchHttpClient(),
});

export function isStripeTestEnvironment() {
	return env.VERCEL_ENV === 'development' || env.VERCEL_ENV === 'preview';
}
