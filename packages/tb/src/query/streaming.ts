import type { z } from 'zod/v4';

import { tinybird } from '../index';
import {
	spotifyAlbumTimeseriesDataSchema,
	spotifyArtistTimeseriesDataSchema,
	spotifyStatPipeParamsSchema,
	spotifyStatQuerySchema,
	spotifyTrackComparisonDataSchema,
	spotifyTrackTimeseriesDataSchema,
} from '../schema/streaming-query.schema';

// Artist stats timeseries query
export const querySpotifyArtistStats = tinybird.buildPipe({
	pipe: 'spotify_artist_stats__v0',
	data: spotifyArtistTimeseriesDataSchema,
	parameters: spotifyStatPipeParamsSchema,
});

// Track stats timeseries query
export const querySpotifyTrackStats = tinybird.buildPipe({
	pipe: 'spotify_track_stats__v0',
	data: spotifyTrackTimeseriesDataSchema,
	parameters: spotifyStatPipeParamsSchema,
});

// Album stats timeseries query
export const querySpotifyAlbumStats = tinybird.buildPipe({
	pipe: 'spotify_album_stats__v0',
	data: spotifyAlbumTimeseriesDataSchema,
	parameters: spotifyStatPipeParamsSchema,
});

// Track comparison query (for comparing multiple track versions)
export const querySpotifyTrackComparison = tinybird.buildPipe({
	pipe: 'spotify_track_comparison__v0',
	data: spotifyTrackComparisonDataSchema,
	parameters: spotifyStatPipeParamsSchema,
});

// Helper function to build query parameters from client query
export function buildSpotifyStatQueryParams(
	query: z.infer<typeof spotifyStatQuerySchema>,
	workspaceId: string,
): z.infer<typeof spotifyStatPipeParamsSchema> {
	const now = new Date();
	const { dateRange = '28d', start, end, ...rest } = query;

	// Calculate start/end based on dateRange if not provided
	let startDate = start;
	let endDate = end ?? now.toISOString();

	if (!startDate) {
		const startTimestamp = new Date(now);
		switch (dateRange) {
			case '1d':
				startTimestamp.setDate(startTimestamp.getDate() - 1);
				break;
			case '1w':
				startTimestamp.setDate(startTimestamp.getDate() - 7);
				break;
			case '28d':
				startTimestamp.setDate(startTimestamp.getDate() - 28);
				break;
			case '1y':
				startTimestamp.setFullYear(startTimestamp.getFullYear() - 1);
				break;
		}
		startDate = startTimestamp.toISOString();
	}

	return {
		workspaceId,
		start: startDate,
		end: endDate,
		...rest,
	};
}
