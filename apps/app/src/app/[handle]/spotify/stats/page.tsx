import { DashContentHeader } from '~/app/[handle]/_components/dash-content-header';
import { SpotifyArtistStats } from './spotify-artist-stats';
import { SpotifyTracksOverview } from './spotify-tracks-overview';
import { SpotifyAlbumsOverview } from './spotify-albums-overview';

export default function SpotifyStatsPage() {
	return (
		<>
			<DashContentHeader title='Spotify Stats' />
			<div className='space-y-6'>
				<SpotifyArtistStats />
				<SpotifyTracksOverview />
				<SpotifyAlbumsOverview />
			</div>
		</>
	);
}