import type { Metadata } from 'next';

import { SwarmContent } from './swarm-content';

export const metadata: Metadata = {
	title: 'Swarm - Micro-Creator Campaigns | Barely NYC',
	description:
		'Coordinated micro-creator campaigns for singles that need momentum. Distribute your music across dozens of small, trusted voices in niche communities.',
};

export default function SwarmPage() {
	return <SwarmContent />;
}
