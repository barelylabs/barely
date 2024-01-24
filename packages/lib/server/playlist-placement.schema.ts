import type { InferSelectModel } from "drizzle-orm";
import type { z } from "zod";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

import { PlaylistPlacements } from "./playlist-placement.sql";

export const insertPlaylistPlacementSchema =
  createInsertSchema(PlaylistPlacements);
export const createPlaylistPlacementSchema = insertPlaylistPlacementSchema.omit(
  {
    id: true,
  },
);
export const updatePlaylistPlacementSchema = insertPlaylistPlacementSchema
  .partial()
  .required({ id: true });

export const upsertPlaylistPlacementSchema =
  insertPlaylistPlacementSchema.partial({
    id: true,
  });
export const selectPlaylistPlacementSchema =
  createSelectSchema(PlaylistPlacements);

export type PlaylistPlacement = InferSelectModel<typeof PlaylistPlacements>;
export type CreatePlaylistPlacement = z.infer<
  typeof createPlaylistPlacementSchema
>;
export type UpdatePlaylistPlacement = z.infer<
  typeof updatePlaylistPlacementSchema
>;
export type UpsertPlaylistPlacement = z.infer<
  typeof upsertPlaylistPlacementSchema
>;
export type SelectPlaylistPlacement = z.infer<
  typeof selectPlaylistPlacementSchema
>;
