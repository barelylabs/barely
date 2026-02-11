import type { Metadata } from 'next';

import { RisingContent } from './rising-content';

export const metadata: Metadata = {
	title: 'Rising+ Service - Professional Campaign Engineering | Barely NYC',
	description:
		'Brooklyn-based music marketing engineers for artists with 10-50K monthly listeners (or ready to jumpstart). We design and execute your campaigns with scientific precision.',
};

export default function RisingPlusPage() {
	return <RisingContent />;
}
