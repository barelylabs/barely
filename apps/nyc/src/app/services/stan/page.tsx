import type { Metadata } from 'next';

import { StanContent } from './stan-content';

export const metadata: Metadata = {
	title: 'Stan - Fan Account Management | Barely NYC',
	description:
		'Professional Instagram fan account management for artists. Daily posts, memes, and community building. Add to any plan or purchase standalone.',
};

export default function StanPage() {
	return <StanContent />;
}
