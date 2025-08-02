import { createRateLimiter } from '@barely/utils';

// Spotify Web API rate limits
// Docs: https://developer.spotify.com/documentation/web-api/guides/rate-limits/
const REQUESTS_PER_SECOND = 10; // Conservative limit

export const spotifyRateLimiter = createRateLimiter({
	tokensPerInterval: REQUESTS_PER_SECOND,
	interval: 'second',
	fireImmediately: true,
});
