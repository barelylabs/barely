import type { TrackWith_Workspace_Genres_Files } from '../track/track.schema';

interface SpotifyTrackOptionArtist
	extends Pick<TrackWith_Workspace_Genres_Files['workspace'], 'name'> {
	id?: string;
	handle?: string;
	spotifyArtistId: string;
}

export type SpotifyTrackOption = Pick<
	TrackWith_Workspace_Genres_Files,
	'id' | 'name' | 'isrc' | 'spotifyId' | 'released' | 'imageUrl'
> & {
	workspace: SpotifyTrackOptionArtist;
};
