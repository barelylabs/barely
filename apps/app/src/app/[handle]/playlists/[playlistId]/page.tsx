import { Suspense } from 'react';

import { HydrateClient, prefetch, trpc } from '~/trpc/server';
import { DashContentHeader } from '../../_components/dash-content-header';
import { Playlist } from './playlist';

export default async function PlaylistPage({
	params,
}: {
	params: Promise<{ handle: string; playlistId: string }>;
}) {
	const { handle, playlistId } = await params;

	prefetch(
		trpc.playlist.byId.queryOptions({
			handle,
			playlistId,
		}),
	);

	return (
		<HydrateClient>
			<DashContentHeader title='Playlist' subtitle='Manage your playlist' />

			<Suspense fallback={<div>Loading...</div>}>
				<Playlist />
			</Suspense>
		</HydrateClient>
	);
}
