import { redirect } from 'next/navigation';

import { getServerSession } from 'next-auth/next';

import { authOptions } from '@barely/lib/auth';

import { PlaylistPitchSubmissionForm } from './playlist-pitch-form';

const NewCampaignPage = async () => {
	const session = await getServerSession(authOptions);
	if (session?.user) return redirect('/campaigns/playlist-pitch');

	return (
		<>
			<PlaylistPitchSubmissionForm />
		</>
	);
};

export default NewCampaignPage;
