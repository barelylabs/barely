import { Suspense } from 'react';

import { DashContentHeader } from '../../_components/dash-content-header';
import { Playlist } from './playlist';

const PlaylistPage = ({ params }: { params: { playlistId: string } }) => {
	return (
		<>
			<DashContentHeader title='Playlist' subtitle='Manage your playlist' />

			<Suspense fallback={<div>Loading...</div>}>
				<Playlist id={params.playlistId} />
			</Suspense>
		</>
	);
};

export default PlaylistPage;
