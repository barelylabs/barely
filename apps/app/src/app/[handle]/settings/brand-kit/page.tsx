import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { getSession } from '~/auth/server';
import { HydrateClient, prefetch, primeWorkspace, trpc } from '~/trpc/server';
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

	// Prefetch brand kit data
	prefetch(trpc.brandKit.current.queryOptions({ handle: workspace.handle }));

	return (
		<HydrateClient>
			<BrandKitPage />
		</HydrateClient>
	);
}
