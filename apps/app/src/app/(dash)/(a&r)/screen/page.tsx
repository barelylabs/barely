import { redirect } from 'next/navigation';

import { getCampaignsToScreen } from '@barely/api/campaign/campaign.node.fns';
import { getServerUser } from '@barely/auth/get-session';

import { DashContentHeader } from '~/app/(dash)/components/dash-content-header';

import { PitchScreenForm } from './playlist-pitch-screen-form';

const ScreenPage = async () => {
	// const user = await getServerUser();

	// if (user && !user.pitchScreening) {
	// 	console.log('redirect bitch');
	// 	redirect('/campaigns');
	// }

	const initialCampaigns = await getCampaignsToScreen();

	return (
		<>
			<DashContentHeader title='Screening' />
			<PitchScreenForm initialCampaigns={initialCampaigns} data-superjson />
		</>
	);
};

export default ScreenPage;
