import type { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'barely.cart - Direct-to-Fan Sales That Convert',
	description:
		'Replace Shopify with landing page + checkout funnels built for direct-to-fan campaigns. Order bumps, post-purchase upsells, real-time shipping, and full conversion analytics.',
};

export default function CartLayout({ children }: { children: React.ReactNode }) {
	return children;
}
