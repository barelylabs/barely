import { Suspense } from 'react';

import { DashContentHeader } from '~/app/[handle]/_components/dash-content-header';
import { AddDomainButton } from '~/app/[handle]/settings/domains/_components/add-web-domain-button';
import { AllDomains } from '~/app/[handle]/settings/domains/_components/all-web-domains';
import { DomainModal } from '~/app/[handle]/settings/domains/_components/web-domain-modal';
import { DomainsHotKeys } from '~/app/[handle]/settings/domains/_components/web-domains-hotkeys';

// import { AddDomainButton } from '~/app/[handle]/settings/domains/web/_components/add-web-domain-button';
// import { AllDomains } from '~/app/[handle]/settings/domains/web/_components/all-web-domains';
// import { DomainModal } from '~/app/[handle]/settings/domains/web/_components/web-domain-modal';
// import { DomainsHotKeys } from '~/app/[handle]/settings/domains/web/_components/web-domains-hotkeys';

export default function DomainsPage() {
	return (
		<>
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
		</>
	);
}
