import type { Metadata } from 'next';

import { BreakoutContent } from './breakout-content';

export const metadata: Metadata = {
	title: 'Breakout+ Service - Maximum Growth Engineering | Barely NYC',
	description:
		'Brooklyn-based music marketing engineers for artists with 50K+ monthly listeners ready to scale aggressively. Full campaign execution with scientific optimization.',
};

export default function BreakoutPlusPage() {
	return <BreakoutContent />;
}
