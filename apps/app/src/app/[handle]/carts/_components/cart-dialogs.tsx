'use client';

import { useWorkspace } from '@barely/lib/hooks/use-workspace';

import { Alert } from '@barely/ui/elements/alert';

import { env } from '~/env';

export function CartDialogs() {
	const {
		handle,
		shippingAddressPostalCode,
		cartSupportEmail,
		stripeConnectAccountId,
		stripeConnectAccountId_devMode,
	} = useWorkspace();

	const stripeConnected =
		env.NEXT_PUBLIC_VERCEL_ENV === 'production' ?
			stripeConnectAccountId
		:	stripeConnectAccountId_devMode;

	const atLeastOneDialog =
		!shippingAddressPostalCode || !cartSupportEmail || !stripeConnected;

	if (!atLeastOneDialog) return null;

	return (
		<div className='flex flex-col gap-4'>
			{!shippingAddressPostalCode && (
				<Alert
					variant='warning'
					title='No shipping from address'
					actionLabel='Set up shipping from address'
					actionHref={`/${handle}/settings/cart`}
				/>
			)}
			{!cartSupportEmail && (
				<Alert
					variant='warning'
					title='Your support email is not set'
					actionLabel='Please set up a contact email for your customers to reach out to you.'
					actionHref={`/${handle}/settings/cart`}
				/>
			)}
			{!stripeConnected && (
				<Alert
					variant='warning'
					title='Stripe is not connected'
					actionLabel='Connect Stripe to accept payments'
					actionHref={`/${handle}/settings/payouts`}
				/>
			)}
		</div>
	);
}
