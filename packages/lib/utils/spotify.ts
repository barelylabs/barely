export function getSpotifyPlaylistTrackDeeplink({
	playlistUrl,
	trackUrl,
}: {
	playlistUrl: string;
	trackUrl: string;
}) {
	// we have a playlist url in this format: https://open.spotify.com/playlist/4mW0Wo6gMrE0K8iALUCByK?si=26c13373e28944b8
	// we have a track url in this format: https://open.spotify.com/track/5nYrALRnMuqCeqXl2oK2qh?si=26c13373e28944b8
	// we want to return a deeplink in this format: https://open.spotify.com/track/5nYrALRnMuqCeqXl2oK2qh?context=spotify:playlist:4mW0Wo6gMrE0K8iALUCByK?si=

	const parsedPlaylistLink = parseSpotifyUrl(playlistUrl);
	const parsedTrackLink = parseSpotifyUrl(trackUrl);

	if (!parsedPlaylistLink || !parsedTrackLink) {
		return null;
	}

	return `https://open.spotify.com/track/${parsedTrackLink.id}?context=spotify:playlist:${parsedPlaylistLink.id}`;
}

export function parseSpotifyUrl(url: string) {
	const match = url.match(
		/https?:\/\/open\.spotify\.com\/(artist|track|album|playlist)\/([a-zA-Z0-9]+)/,
	);

	if (!match) {
		return null;
	}

	return {
		type: match[1],
		id: match[2],
	};
}
