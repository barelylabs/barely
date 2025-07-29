import { z } from 'zod/v4';

// Base schema for all streaming stats
const baseStreamingStatSchema = z.object({
	timestamp: z.string(), // ISO timestamp
	workspaceId: z.string(),
});

// Artist stats schema
export const artistStreamingStatSchema = baseStreamingStatSchema.extend({
	type: z.literal('artist'),
	spotifyId: z.string(),
	spotifyFollowers: z.number().optional(),
	spotifyPopularity: z.number().optional(),
	spotifyListeners: z.number().optional(),
	spotifyStreams: z.number().optional(),
});

// Track stats schema
export const trackStreamingStatSchema = baseStreamingStatSchema.extend({
	type: z.literal('track'),
	spotifyId: z.string(),
	spotifyPopularity: z.number().optional(),
	spotifyListeners: z.number().optional(),
	spotifyStreams: z.number().optional(),
});

// Album stats schema
export const albumStreamingStatSchema = baseStreamingStatSchema.extend({
	type: z.literal('album'),
	spotifyId: z.string(),
	spotifyPopularity: z.number().optional(),
	spotifyListeners: z.number().optional(),
	spotifyStreams: z.number().optional(),
});

// Union type for all streaming stats
export const streamingStatSchema = z.discriminatedUnion('type', [
	artistStreamingStatSchema,
	trackStreamingStatSchema,
	albumStreamingStatSchema,
]);

export type StreamingStat = z.infer<typeof streamingStatSchema>;
export type ArtistStreamingStat = z.infer<typeof artistStreamingStatSchema>;
export type TrackStreamingStat = z.infer<typeof trackStreamingStatSchema>;
export type AlbumStreamingStat = z.infer<typeof albumStreamingStatSchema>;
