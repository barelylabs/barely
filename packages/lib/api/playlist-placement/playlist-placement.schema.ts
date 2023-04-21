import { z } from 'zod';

const playlistPlacementSchema = z.object({
	id: z.string(),
	trackId: z.string(),
	pitchReviewId: z.string().nullish(),
	playlistId: z.string(),
	playlistPosition: z.number().nullish(),
	addDate: z.date().nullish(),
	daysInPlaylist: z.number().min(14).nullish(),
	removeDate: z.date().nullish(),
	// state
	addedToPlaylist: z.boolean().nullish(),
	removedFromPlaylist: z.boolean().nullish(),
});

const createPlaylistPlacementSchema = playlistPlacementSchema
	.omit({
		id: true,
		removeDate: true,
		addedToPlaylist: true,
		removedFromPlaylist: true,
	})
	.extend({
		pitchReviewId: playlistPlacementSchema.shape.pitchReviewId.unwrap().unwrap(),
		playlistPosition: playlistPlacementSchema.shape.playlistPosition.unwrap().unwrap(),
		addDate: playlistPlacementSchema.shape.addDate.unwrap().unwrap(),
		removeDate: playlistPlacementSchema.shape.removeDate.unwrap(),
		// daysInPlaylist: playlistPlacementSchema.shape.daysInPlaylist.unwrap().unwrap(),
	});

export { playlistPlacementSchema, createPlaylistPlacementSchema };
