import { notFound } from 'next/navigation';

import { api } from '@barely/server/api/react';

import { DashContentHeader } from '~/app/[handle]/_components/dash-content-header';
import { SpotifyStatHeader } from './spotify-stat-header';
import { SpotifyTimeseries } from './spotify-timeseries';
import { LinkedSpotifyTracks } from './linked-spotify-tracks';

export default async function TrackSpotifyStatsPage({
	params,
}: {
	params: { handle: string; trackId: string };
}) {
	const track = await api.track.byId.fetch({
		handle: params.handle,
		id: params.trackId,
	});

	if (!track) {
		notFound();
	}

	return (
		<>
			<DashContentHeader title={`${track.name} - Spotify Stats`} />
			<SpotifyStatHeader trackId={track.id} />
			<SpotifyTimeseries trackId={track.id} />
			<LinkedSpotifyTracks trackId={track.id} />
		</>
	);
}