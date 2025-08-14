import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { DashContent } from '~/app/[handle]/_components/dash-content';
import { DashContentHeader } from '~/app/[handle]/_components/dash-content-header';
import { getSession } from '~/auth/server';
import { HydrateClient, prefetch, primeWorkspace, trpc } from '~/trpc/server';
import { BioButtonsPage } from '../../_components/bio-buttons-page';

export const metadata: Metadata = {
	title: 'Bio - Edit',
	description: 'Edit your bio page',
};

export default async function BioHomePage({
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

	// Prefetch bio data with blocks
	prefetch(
		trpc.bio.byHandleWithBlocks.queryOptions({
			handle: awaitedParams.handle,
			key: 'home',
		}),
	);

	return (
		<HydrateClient>
			<DashContentHeader title='Bio Home' subtitle='Edit your bio page content' />
			<DashContent>
				<BioButtonsPage handle={awaitedParams.handle} />
			</DashContent>
		</HydrateClient>
	);
}
