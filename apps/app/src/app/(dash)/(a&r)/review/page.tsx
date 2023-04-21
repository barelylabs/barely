// import { getGenresByUserId } from '@barely/api/genre/genre.node.fns';
// import { getServerUser } from '@barely/auth/get-session';

import { Suspense } from 'react';

import { redirect } from 'next/navigation';

import { getPlaylistsByUserId } from '@barely/api/playlist/playlist.node.fns';
import { getServerUser } from '@barely/auth/get-session';

import { PlaylistPitchReviewForm } from '~/app/(dash)/(a&r)/review/playlist-pitch-review-form';
import { DashContentHeader } from '~/app/(dash)/components/dash-content-header';

const ReviewPitchPage = async () => {
	const user = await getServerUser();
	if (!user) redirect('/login');
	const userPlaylists = await getPlaylistsByUserId(user.id);

	return (
		<>
			<DashContentHeader title='Review' />
			<Suspense fallback={<div>Loading...</div>}>
				<PlaylistPitchReviewForm playlists={userPlaylists} data-superjson />
			</Suspense>
		</>
	);
};

export default ReviewPitchPage;
