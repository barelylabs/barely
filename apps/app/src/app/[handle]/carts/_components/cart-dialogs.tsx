'use client';

import { useWorkspace } from '@barely/lib/hooks/use-workspace';
import { isProduction } from '@barely/lib/utils/environment';

import { Alert } from '@barely/ui/elements/alert';

export function CartDialogs() {
	const {
		workspace: {
			handle,
			shippingAddressPostalCode,
			cartSupportEmail,
			stripeConnectAccountId,
			stripeConnectAccountId_devMode,
		},
	} = useWorkspace();

	const stripeConnected =
		isProduction() ? stripeConnectAccountId : stripeConnectAccountId_devMode;

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
