import { Mixtapes } from '@barely/db/sql';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod/v4';

import type {
	PublicTrackWith_Artist_Files,
	TrackWith_Workspace_Genres_Files,
} from './track.schema';
import { queryBooleanSchema, querySelectionSchema } from '../helpers';
import { selectTrackSchema } from './track.schema';

export const insertMixtapeTracksSchema = z.array(
	selectTrackSchema.partial().required({ id: true }).extend({
		lexorank: z.string(),
	}),
);

export const insertMixtapeSchema = createInsertSchema(Mixtapes).extend({
	_tracks: insertMixtapeTracksSchema.optional(),
});

export const createMixtapeSchema = insertMixtapeSchema.omit({
	id: true,
	workspaceId: true,
});
export const upsertMixtapeSchema = insertMixtapeSchema.partial({
	id: true,
	workspaceId: true,
});
export const updateMixtapeSchema = insertMixtapeSchema.partial().required({ id: true });

export const selectMixtapeSchema = createSelectSchema(Mixtapes);

export type Mixtape = z.infer<typeof selectMixtapeSchema>;
export type InsertMixtape = z.infer<typeof insertMixtapeSchema>;
export type CreateMixtape = z.infer<typeof createMixtapeSchema>;
export type UpsertMixtape = z.infer<typeof upsertMixtapeSchema>;
export type UpdateMixtape = z.infer<typeof updateMixtapeSchema>;

export interface MixtapeWith_Tracks extends Mixtape {
	tracks: (TrackWith_Workspace_Genres_Files & { lexorank: string })[];
}

// forms
export const defaultMixtape: UpsertMixtape = {
	name: '',
	description: '',
	_tracks: [],
} as const;

export const formatEditMixtapeToUpsertMixtapeForm = (
	mixtape: MixtapeWith_Tracks,
): UpsertMixtape => {
	return {
		...mixtape,
		_tracks: mixtape.tracks.map(t => ({
			id: t.id,
			lexorank: t.lexorank,
		})),
	};
};

// query params
export const mixtapeFilterParamsSchema = z.object({
	search: z.string().optional(),
	showArchived: queryBooleanSchema.optional(),
	// selectedMixtapeIds: queryStringArraySchema.optional(),
});

export const mixtapeSearchParamsSchema = mixtapeFilterParamsSchema.extend({
	selectedMixtapeIds: querySelectionSchema.optional(),
});

export const selectWorkspaceMixtapesSchema = mixtapeFilterParamsSchema.extend({
	// handle: z.string(),
	cursor: z.object({ id: z.string(), createdAt: z.coerce.date() }).optional(),
	limit: z.coerce.number().min(1).max(100).optional().default(10),
});

export type PublicMixtape = Pick<Mixtape, 'id' | 'name' | 'description'>;
export interface PublicMixtapeWith_Tracks extends PublicMixtape {
	tracks: (PublicTrackWith_Artist_Files & { lexorank: string })[];
}
