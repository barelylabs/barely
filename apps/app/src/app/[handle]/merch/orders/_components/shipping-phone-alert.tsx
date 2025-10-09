'use client';

import { useWorkspace } from '@barely/hooks';

import { Alert } from '@barely/ui/alert';

export function ShippingPhoneAlert() {
	const { workspace, handle } = useWorkspace();

	if (workspace.shippingAddressPhone) {
		return null;
	}

	return (
		<Alert
			variant='warning'
			title='Shipping Phone Number Required'
			description='Your business phone number is required to purchase shipping labels. Please add it in your logistics settings.'
			actionLabel='Go to Logistics Settings'
			actionHref={`/${handle}/merch/logistics`}
		/>
	);
}
