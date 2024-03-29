import { Suspense } from 'react';

import { DashContentHeader } from '~/app/[handle]/_components/dash-content-header';
import { AddDomainButton } from '~/app/[handle]/settings/domains/add-domain-button';
import { AllDomains } from '~/app/[handle]/settings/domains/all-domains';
import { DomainModal } from '~/app/[handle]/settings/domains/domain-modal';
import { DomainsHotKeys } from '~/app/[handle]/settings/domains/domains-hotkeys';

export default function DomainsPage() {
	return (
		<>
			<DashContentHeader
				title='Domains'
				subtitle='Custom domains for this workspace.'
				button={<AddDomainButton />}
			/>
			<DomainsHotKeys />
			<DomainModal />
			<Suspense fallback={<p>Loading...</p>}>
				<AllDomains />
			</Suspense>
		</>
	);
}
