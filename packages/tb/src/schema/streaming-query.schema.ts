import { WORKSPACE_TIMEZONES } from '@barely/const';
import { statDateRange } from '@barely/validators';
import { z } from 'zod/v4';

// Spotify-specific pipe parameters
export const spotifyStatPipeParamsSchema = z.object({
	workspaceId: z.string(),
	start: z.string(),
	end: z.string(),
	dateRange: statDateRange.optional(),
	granularity: z.enum(['month', 'week', 'day']).optional(),
	timezone: z.enum(WORKSPACE_TIMEZONES).optional().default('America/New_York'),

	// Optional filters
	spotifyId: z.string().optional(), // For specific track/album/artist
	type: z.enum(['artist', 'track', 'album']).optional(),
});

// Artist timeseries data schema
export const spotifyArtistTimeseriesDataSchema = z.object({
	timestamp: z.coerce.date(),
	spotifyFollowers: z.number().nullable(),
	spotifyPopularity: z.number().nullable(),
	spotifyMonthlyListeners: z.number().nullable(),
	spotifyTotalListeners: z.number().nullable(),
	spotifyDailyListeners: z.number().nullable(),
	spotifyMonthlyStreams: z.number().nullable(),
	spotifyTotalStreams: z.number().nullable(),
	spotifyDailyStreams: z.number().nullable(),
});

// Track timeseries data schema - now includes both timeseries and previous period data
export const spotifyTrackTimeseriesDataSchema = z.object({
	resultType: z.enum(['timeseries', 'previousPeriod']),
	timestamp: z.string().nullable(), // Changed to string since it comes as formatted string
	spotifyId: z.string(),
	trackName: z.string().nullable(),
	spotifyPopularity: z.number().nullable(),
	spotifyMonthlyListeners: z.number().nullable(),
	spotifyTotalListeners: z.number().nullable(),
	spotifyDailyListeners: z.number().nullable(),
	spotifyMonthlyStreams: z.number().nullable(),
	spotifyTotalStreams: z.number().nullable(),
	spotifyDailyStreams: z.number().nullable(),
	// Previous period aggregates
	avgSpotifyPopularity: z.number().nullish(),
	maxSpotifyPopularity: z.number().nullish(),
	avgSpotifyMonthlyListeners: z.number().nullish(),
	maxSpotifyMonthlyListeners: z.number().nullish(),
	avgSpotifyTotalListeners: z.number().nullish(),
	maxSpotifyTotalListeners: z.number().nullish(),
	avgSpotifyDailyListeners: z.number().nullish(),
	maxSpotifyDailyListeners: z.number().nullish(),
	avgSpotifyMonthlyStreams: z.number().nullish(),
	maxSpotifyMonthlyStreams: z.number().nullish(),
	avgSpotifyTotalStreams: z.number().nullish(),
	maxSpotifyTotalStreams: z.number().nullish(),
	avgSpotifyDailyStreams: z.number().nullish(),
	maxSpotifyDailyStreams: z.number().nullish(),
});

// Album timeseries data schema
export const spotifyAlbumTimeseriesDataSchema = z.object({
	timestamp: z.coerce.date(),
	spotifyId: z.string(),
	albumName: z.string().optional(),
	spotifyPopularity: z.number().nullable(),
	spotifyMonthlyListeners: z.number().nullable(),
	spotifyTotalListeners: z.number().nullable(),
	spotifyDailyListeners: z.number().nullable(),
	spotifyMonthlyStreams: z.number().nullable(),
	spotifyTotalStreams: z.number().nullable(),
	spotifyDailyStreams: z.number().nullable(),
});

// Query schemas for client use
export const spotifyStatQuerySchema = z.object({
	dateRange: statDateRange.optional().default('28d'),
	start: z.string().optional(),
	end: z.string().optional(),
	spotifyId: z.string().optional(),
	type: z.enum(['artist', 'track', 'album']).optional(),
});

export type SpotifyStatQuery = z.infer<typeof spotifyStatQuerySchema>;
