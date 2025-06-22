import { Suspense } from 'react';

import { DashContentHeader } from '../../_components/dash-content-header';
import { Playlist } from './playlist';

const PlaylistPage = async ({ params }: { params: Promise<{ playlistId: string }> }) => {
	const { playlistId } = await params;
	return (
		<>
			<DashContentHeader title='Playlist' subtitle='Manage your playlist' />

			<Suspense fallback={<div>Loading...</div>}>
				<Playlist id={playlistId} />
			</Suspense>
		</>
	);
};

export default PlaylistPage;
