import { TrackWithArtist } from '../track/track.schema';

interface SpotifyTrackOptionArtist extends Pick<TrackWithArtist['artist'], 'name'> {
	id?: string;
	handle?: string;
	spotifyArtistId: string;
}

type SpotifyTrackOption = Pick<
	TrackWithArtist,
	'name' | 'isrc' | 'spotifyId' | 'released' | 'imageUrl'
> & {
	id?: string;
	artist: SpotifyTrackOptionArtist;
};

export type { SpotifyTrackOption };
