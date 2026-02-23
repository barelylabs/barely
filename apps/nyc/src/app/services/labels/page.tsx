import type { Metadata } from 'next';

import { LabelsContent } from './labels-content';

export const metadata: Metadata = {
	title: 'Labels & Distributors - Roster-Level Marketing Engineering | Barely NYC',
	description:
		'Roster-level marketing engineering for labels and distributors who need more than a campaign vendor. Custom partnerships from single-artist campaigns to full roster strategy.',
};

export default function LabelsPage() {
	return <LabelsContent />;
}
