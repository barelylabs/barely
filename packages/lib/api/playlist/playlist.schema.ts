import { z } from 'zod';

const playlistSchema = z.object({
	id: z.string(),
	teamId: z.string(),
	// accounts
	appleMusicId: z.string().optional(),
	appleMusicAccountId: z.string().optional(),
	deezerId: z.string().optional(),
	deezerAccountId: z.string().optional(),
	soundCloudId: z.string().optional(),
	soundCloudAccountId: z.string().optional(),
	spotifyId: z.string().optional(),
	spotifyAccountId: z.string().optional(),
	tidalId: z.string().optional(),
	tidalAccountId: z.string().optional(),
	youtubeId: z.string().optional(),
	youtubeAccountId: z.string().optional(),
	// metadata
	name: z.string(),
	description: z.string().optional(),
	public: z.boolean(),
	userOwned: z.boolean(),
	totalTracks: z.number().optional(),
	genres: z.array(z.string()),
	// campaigns
	campaigns: z.array(z.string()),
	forTesting: z.boolean(),
	placements: z.array(z.string()),
	// artwork
	coverId: z.string(),
	coverRenders: z.array(z.string()),
	// links
	linkId: z.string().optional(),
	// clones
	cloneChildren: z.array(z.string()),
	cloneParentId: z.string().optional(),
	// analytics
	stats: z.array(z.string()),
});

export { playlistSchema };
