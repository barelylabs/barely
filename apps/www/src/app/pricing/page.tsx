import type { Metadata } from 'next';

import { PricingContent } from '~/components/pricing-content';

export const metadata: Metadata = {
	title: 'Pricing - barely.ai',
	description:
		'Transparent pricing that scales with your music career. From bedroom to label-level operations.',
};

export default function PricingPage() {
	return <PricingContent />;
}
