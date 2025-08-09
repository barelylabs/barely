import { SpotifyArtistSettings } from '~/app/[handle]/settings/streaming/spotify-artist-settings';

export function StreamingSettings() {
	return (
		<div className='flex flex-col gap-8'>
			<SpotifyArtistSettings />
			{/* Future DSP modules (Apple Music, YouTube, etc.) can be added here */}
		</div>
	);
}
