import type { InferSelectModel } from 'drizzle-orm';
import type { z } from 'zod/v4';
import { Albums } from '@barely/db/sql';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

export const insertAlbumSchema = createInsertSchema(Albums);
export const selectAlbumSchema = createSelectSchema(Albums);

export type Album = InferSelectModel<typeof Albums>;
export type InsertAlbum = z.infer<typeof insertAlbumSchema>;
export type SelectAlbum = z.infer<typeof selectAlbumSchema>;
