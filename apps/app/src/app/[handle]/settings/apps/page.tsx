import type { Metadata } from 'next';

import { ProviderAccountCard } from '~/app/[handle]/settings/apps/provider-account-card';
import { DashContentHeader } from '../../_components/dash-content-header';

export const metadata: Metadata = {
	title: 'Accounts',
};

const IntegrationsPage = () => {
	return (
		<>
			<DashContentHeader title='Accounts' subtitle='Connect your external accounts' />
			<ProviderAccountCard provider='mailchimp' />
			<ProviderAccountCard provider='tiktok' />
		</>
	);
};

export default IntegrationsPage;
