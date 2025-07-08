import { redirect } from 'next/navigation';

import { DashContentHeader } from '~/app/[handle]/_components/dash-content-header';
import { PlaylistPitchForm } from '~/app/[handle]/campaigns/playlist-pitch/playlist-pitch-form';
import { getSession } from '~/auth/server';

// import { PlaylistPitchForm } from '../../(dash.old)/campaigns/playlist-pitch/playlist-pitch-form';

const NewCampaignPage = async () => {
	const session = await getSession();
	if (session?.user) return redirect('/campaigns/playlist-pitch');

	return (
		<>
			<DashContentHeader
				title='playlist.pitch'
				subtitle='Submit your track for screening'
			/>
			<PlaylistPitchForm />
		</>
	);
};

export default NewCampaignPage;
