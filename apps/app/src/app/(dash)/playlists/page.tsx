import { getPlaylistsByUserId } from '@barely/lib/api/playlist/playlist.node.fns';
import { getServerUser } from '@barely/lib/auth/get-session';

import { Container } from '@barely/ui/elements/container';
import { H3 } from '@barely/ui/elements/typography';

import { AllPlaylists } from './all-playlists';

const PlaylistPage = async () => {
	const user = await getServerUser();

	if (!user) {
		return {
			redirect: {
				destination: '/login',
			},
		};
	}

	const initialPlaylists = await getPlaylistsByUserId(user.id);

	console.log('user => ', user);

	return (
		<Container>
			<H3>Playlists</H3>
			<AllPlaylists initialPlaylists={initialPlaylists} />
		</Container>
	);
};

export default PlaylistPage;
