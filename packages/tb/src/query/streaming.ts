import type { z } from 'zod/v4';

import type { spotifyStatQuerySchema } from '../schema/streaming-query.schema';
import { tinybird } from '../index';
import {
	spotifyAlbumTimeseriesDataSchema,
	spotifyArtistTimeseriesDataSchema,
	spotifyStatPipeParamsSchema,
	spotifyTrackTimeseriesDataSchema,
} from '../schema/streaming-query.schema';

// Artist stats timeseries query
export const pipe_spotifyArtistTimeseries = tinybird.buildPipe({
	pipe: 'spotify_artist_timeseries',
	data: spotifyArtistTimeseriesDataSchema,
	parameters: spotifyStatPipeParamsSchema,
});

// Track stats timeseries query
export const pipe_spotifyTrackTimeseries = tinybird.buildPipe({
	pipe: 'spotify_track_timeseries',
	data: spotifyTrackTimeseriesDataSchema,
	parameters: spotifyStatPipeParamsSchema,
});

// Album stats timeseries query
export const pipe_spotifyAlbumTimeseries = tinybird.buildPipe({
	pipe: 'spotify_album_timeseries',
	data: spotifyAlbumTimeseriesDataSchema,
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
	const endDate = end ?? now.toISOString();

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
		timezone: 'America/New_York' as const,
		...rest,
	};
}

// Query wrapper functions for convenience
export async function querySpotifyArtistStats(params: {
	workspaceId: string;
	start: string;
	end: string;
	granularity?: 'month' | 'week' | 'day';
	timezone?: z.infer<typeof spotifyStatPipeParamsSchema>['timezone'];
}) {
	return pipe_spotifyArtistTimeseries({
		...params,
		timezone: params.timezone ?? 'America/New_York',
	});
}

export async function querySpotifyTrackStats(params: {
	workspaceId: string;
	start: string;
	end: string;
	spotifyId?: string;
	granularity?: 'month' | 'week' | 'day';
	timezone?: z.infer<typeof spotifyStatPipeParamsSchema>['timezone'];
}) {
	return pipe_spotifyTrackTimeseries({
		...params,
		timezone: params.timezone ?? 'America/New_York',
	});
}

export async function querySpotifyAlbumStats(params: {
	workspaceId: string;
	start: string;
	end: string;
	spotifyId?: string;
	granularity?: 'month' | 'week' | 'day';
	timezone?: z.infer<typeof spotifyStatPipeParamsSchema>['timezone'];
}) {
	return pipe_spotifyAlbumTimeseries({
		...params,
		timezone: params.timezone ?? 'America/New_York',
	});
}

export async function querySpotifyTrackComparison(params: {
	workspaceId: string;
	start: string;
	end: string;
	spotifyId: string;
	granularity?: 'month' | 'week' | 'day';
	timezone?: z.infer<typeof spotifyStatPipeParamsSchema>['timezone'];
}) {
	// For now, just return track stats (comparison functionality can be added later)
	return pipe_spotifyTrackTimeseries({
		...params,
		timezone: params.timezone ?? 'America/New_York',
	});
}
