import type { Metadata } from 'next';

import { FulfillmentContent } from './fulfillment-content';

export const metadata: Metadata = {
	title: 'Merch Fulfillment for Independent Artists | Barely NYC',
	description:
		'Ship us your inventory and we handle the rest. Pick, pack, and ship from Brooklyn. No minimums, no setup fees. Built into barely.cart.',
	robots: {
		index: false,
		follow: false,
	},
};

export default function FulfillmentPage() {
	return <FulfillmentContent />;
}
