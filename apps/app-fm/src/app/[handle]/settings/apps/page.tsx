import type { Metadata } from 'next';
import { Suspense } from 'react';

import { ProviderAccountCard } from '~/app/[handle]/settings/apps/provider-account-card';
import { DashContentHeader } from '../../_components/dash-content-header';

export const metadata: Metadata = {
	title: 'Accounts',
};

const IntegrationsPage = () => {
	return (
		<>
			<DashContentHeader title='Accounts' subtitle='Connect your external accounts' />
			<Suspense fallback={<div>Loading...</div>}>
				<ProviderAccountCard provider='mailchimp' />
				<ProviderAccountCard provider='tiktok' />
				<ProviderAccountCard provider='spotify' />
			</Suspense>
		</>
	);
};

export default IntegrationsPage;
