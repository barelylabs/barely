import { redirect } from 'next/navigation';

import { getServerSession } from 'next-auth';

import { userGetPlaylistById } from '@barely/lib/api/playlist/playlist.node.fns';
import { authOptions } from '@barely/lib/auth';

// import { getServerUser } from '@barely/lib/auth';

import { Container } from '@barely/ui/elements/container';
import { H3 } from '@barely/ui/elements/typography';

import { Playlist } from './playlist';

const PlaylistPage = async ({ params }: { params: { playlistId: string } }) => {
	// const user = await getServerUser();
	const session = await getServerSession(authOptions);

	if (!session?.user) return redirect('/login');

	const initPlaylist = await userGetPlaylistById({
		userId: session.user.id,
		playlistId: params.playlistId,
	});

	if (!initPlaylist) redirect('/playlists');

	return (
		<Container>
			<H3>Playlist</H3>
			{/* {response.response} */}
			<Playlist initPlaylist={initPlaylist} />
		</Container>
	);
};

export default PlaylistPage;
