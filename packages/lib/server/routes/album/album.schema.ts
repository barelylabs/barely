import type { InferSelectModel } from 'drizzle-orm';
import type { z } from 'zod';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

import { Albums } from './album.sql';

export const insertAlbumSchema = createInsertSchema(Albums);
export const selectAlbumSchema = createSelectSchema(Albums);

export type Album = InferSelectModel<typeof Albums>;
export type InsertAlbum = z.infer<typeof insertAlbumSchema>;
export type SelectAlbum = z.infer<typeof selectAlbumSchema>;
