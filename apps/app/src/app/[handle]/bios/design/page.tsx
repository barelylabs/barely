import type { Metadata } from 'next';

import { DashContent } from '~/app/[handle]/_components/dash-content';
import { DashContentHeader } from '~/app/[handle]/_components/dash-content-header';
import { BioDesignSection } from '~/app/[handle]/bios/design/bio-design-section';
import { HydrateClient, prefetch, trpc } from '~/trpc/server';

export const metadata: Metadata = {
	title: 'Bio - Design',
	description: 'Customize your link-in-bio design',
};

export default async function BioPage({
	params,
}: {
	params: Promise<{ handle: string }>;
}) {
	const awaitedParams = await params;

	// Prefetch bio data
	prefetch(trpc.bio.byKey.queryOptions({ handle: awaitedParams.handle }));

	return (
		<HydrateClient>
			<DashContentHeader title='Bio Design' subtitle='Customize themes and appearance' />
			<DashContent>
				<BioDesignSection />
			</DashContent>
		</HydrateClient>
	);
}
