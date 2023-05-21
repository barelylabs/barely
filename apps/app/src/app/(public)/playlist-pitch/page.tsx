import { redirect } from 'next/navigation';

import { getServerSession } from 'next-auth/next';

import { authOptions } from '@barely/lib/auth';

import { H1 } from '@barely/ui/elements';

import { DashContentHeader } from '~/app/(dash)/components/dash-content-header';

import { PlaylistPitchSubmissionForm } from '../../(dash)/campaigns/playlist-pitch/playlist-pitch-form';

const NewCampaignPage = async () => {
	const session = await getServerSession(authOptions);
	if (session?.user) return redirect('/campaigns/playlist-pitch');

	return (
		<>
			{/* <H1>playlist.pitch</H1> */}
			<DashContentHeader
				title='playlist.pitch'
				subtitle='Submit your track for screening'
			/>
			<PlaylistPitchSubmissionForm />
		</>
	);
};

export default NewCampaignPage;
