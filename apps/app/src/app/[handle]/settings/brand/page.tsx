import type { Metadata } from 'next';

import { HydrateClient, prefetch, trpc } from '~/trpc/server';
import { BrandKitPage } from './brand-kit-page';

export const metadata: Metadata = {
	title: 'Brand Kit',
	description: 'Manage your unified brand design system',
};

export default async function BrandKitSettingsPage({
	params,
}: {
	params: Promise<{ handle: string }>;
}) {
	const { handle } = await params;

	// Prefetch brand kit data
	prefetch(trpc.brandKit.current.queryOptions({ handle }));

	return (
		<HydrateClient>
			<BrandKitPage />
		</HydrateClient>
	);
}
