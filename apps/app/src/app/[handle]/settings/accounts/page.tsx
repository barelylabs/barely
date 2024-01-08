import type { Metadata } from 'next';

import { DashContentHeader } from '../../_components/dash-content-header';

export const metadata: Metadata = {
	title: 'Accounts',
};

const ExternalAccountsPage = () => {
	return (
		<>
			<DashContentHeader title='Accounts' subtitle='Connect your external accounts' />
			{/* <ProviderAccountCard provider='spotify' /> */}
		</>
	);
};

export default ExternalAccountsPage;
