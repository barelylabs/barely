import type { Metadata } from 'next';

import { BedroomContent } from './bedroom-content';

export const metadata: Metadata = {
	title: 'Bedroom+ Service - Learn Music Marketing Engineering | Barely NYC',
	description:
		'Perfect for artists with 0-10K monthly listeners. Bi-weekly coaching with Brooklyn-based music marketing engineers + barely.ai tools.',
};

export default function BedroomPlusPage() {
	return <BedroomContent />;
}
