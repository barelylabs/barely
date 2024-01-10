import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

import type { Genre } from "./genre.schema";
import type { Workspace } from "./workspace.schema";
import { genreIdSchema } from "./genre.schema";
import { Tracks } from "./track.sql";

export const insertTrackSchema = createInsertSchema(Tracks);
export const createTrackSchema = insertTrackSchema.omit({ id: true });
export const upsertTrackSchema = insertTrackSchema.partial({ id: true });
export const updateTrackSchema = insertTrackSchema
  .partial()
  .required({ id: true })
  .extend({
    genreIds: z.array(genreIdSchema).optional(),
  });
export const selectTrackSchema = createSelectSchema(Tracks);

export type Track = z.infer<typeof insertTrackSchema>;
export type CreateTrack = z.infer<typeof createTrackSchema>;
export type UpsertTrack = z.infer<typeof upsertTrackSchema>;
export type UpdateTrack = z.infer<typeof updateTrackSchema>;
export type SelectTrack = z.infer<typeof selectTrackSchema>;

// queries

export interface TrackWithWorkspaceAndGenres extends Track {
  workspace: Workspace;
  genres: Genre[];
}
