import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { DashContent } from '~/app/[handle]/_components/dash-content';
import { DashContentHeader } from '~/app/[handle]/_components/dash-content-header';
import { getSession } from '~/auth/server';
import { HydrateClient, prefetch, primeWorkspace, trpc } from '~/trpc/server';
import { BioDesignPage } from './bio-design-page';

export const metadata: Metadata = {
	title: 'Bio - Design',
	description: 'Customize your link-in-bio design',
};

export default async function BioPage({
	params,
}: {
	params: Promise<{ handle: string }>;
}) {
	const session = await getSession();

	if (!session) {
		redirect('/login');
	}

	const awaitedParams = await params;
	const user = session.user;
	const workspace = user.workspaces.find(w => w.handle === awaitedParams.handle);

	if (!workspace) {
		redirect('/login');
	}

	// Prime workspace for tRPC
	primeWorkspace(workspace);

	// Prefetch bio data
	prefetch(trpc.bio.byHandle.queryOptions({ handle: awaitedParams.handle }));

	return (
		<HydrateClient>
			<DashContentHeader title='Bio Design' subtitle='Customize themes and appearance' />
			<DashContent>
				<BioDesignPage handle={awaitedParams.handle} />
			</DashContent>
		</HydrateClient>
	);
}
