import type { Metadata } from 'next';

import { FulfilledContent } from './fulfilled-content';

export const metadata: Metadata = {
	title: 'Fulfilled - Merch Fulfillment for Independent Artists | Barely NYC',
	description:
		'Ship us your inventory and we handle the rest. Pick, pack, and ship from Brooklyn. No minimums, no setup fees. Built into barely.cart.',
	robots: {
		index: false,
		follow: false,
	},
};

export default function FulfilledPage() {
	return <FulfilledContent />;
}
