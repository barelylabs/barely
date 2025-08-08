import { Suspense } from 'react';

import { DashContentHeader } from '~/app/[handle]/_components/dash-content-header';
import { AddDomainButton } from '~/app/[handle]/settings/domains/_components/add-web-domain-button';
import { AllDomains } from '~/app/[handle]/settings/domains/_components/all-web-domains';
import { DomainModal } from '~/app/[handle]/settings/domains/_components/web-domain-modal';
import { DomainsHotKeys } from '~/app/[handle]/settings/domains/_components/web-domains-hotkeys';
import { HydrateClient, prefetch, trpc } from '~/trpc/server';

// import { AddDomainButton } from '~/app/[handle]/settings/domains/web/_components/add-web-domain-button';
// import { AllDomains } from '~/app/[handle]/settings/domains/web/_components/all-web-domains';
// import { DomainModal } from '~/app/[handle]/settings/domains/web/_components/web-domain-modal';
// import { DomainsHotKeys } from '~/app/[handle]/settings/domains/web/_components/web-domains-hotkeys';

export default async function DomainsPage({
	params,
}: {
	params: Promise<{ handle: string }>;
}) {
	const { handle: _handle } = await params;

	// Prefetch domains data for the AllDomains component
	prefetch(trpc.webDomain.byWorkspace.queryOptions({ handle: _handle }));

	return (
		<HydrateClient>
			<DashContentHeader
				title='Web Domains'
				subtitle='Custom domains for destinations.'
				button={<AddDomainButton />}
			/>
			<DomainsHotKeys />
			<DomainModal />
			<Suspense fallback={<p>Loading...</p>}>
				<AllDomains />
			</Suspense>
		</HydrateClient>
	);
}
