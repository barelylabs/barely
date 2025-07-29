import { statDateRange } from '@barely/validators';
import { z } from 'zod/v4';

// Spotify-specific pipe parameters
export const spotifyStatPipeParamsSchema = z.object({
	workspaceId: z.string(),
	start: z.string(),
	end: z.string(),
	dateRange: statDateRange.optional(),
	granularity: z.enum(['month', 'day', 'hour']).optional(),

	// Optional filters
	spotifyId: z.string().optional(), // For specific track/album/artist
	type: z.enum(['artist', 'track', 'album']).optional(),
});

// Artist timeseries data schema
export const spotifyArtistTimeseriesDataSchema = z.object({
	timestamp: z.coerce.date(),
	spotifyFollowers: z.number(),
	spotifyPopularity: z.number(),
	spotifyListeners: z.number().nullable(),
	spotifyStreams: z.number().nullable(),
});

// Track timeseries data schema
export const spotifyTrackTimeseriesDataSchema = z.object({
	timestamp: z.coerce.date(),
	spotifyId: z.string(),
	trackName: z.string().optional(),
	spotifyPopularity: z.number(),
	spotifyListeners: z.number().nullable(),
	spotifyStreams: z.number().nullable(),
});

// Album timeseries data schema
export const spotifyAlbumTimeseriesDataSchema = z.object({
	timestamp: z.coerce.date(),
	spotifyId: z.string(),
	albumName: z.string().optional(),
	spotifyPopularity: z.number(),
	spotifyListeners: z.number().nullable(),
	spotifyStreams: z.number().nullable(),
});

// Comparison pipe for multiple tracks
export const spotifyTrackComparisonDataSchema = z.object({
	timestamp: z.coerce.date(),
	tracks: z.array(
		z.object({
			spotifyId: z.string(),
			trackName: z.string().optional(),
			spotifyPopularity: z.number(),
			isDefault: z.boolean(),
		}),
	),
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
