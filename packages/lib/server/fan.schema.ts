import type { InferSelectModel } from 'drizzle-orm';
import type { z } from 'zod';
import { createInsertSchema } from 'drizzle-zod';

import { Fans } from './fan.sql';

export const insertFanSchema = createInsertSchema(Fans);
export const createFanSchema = insertFanSchema.omit({ id: true });
export const updateFanSchema = insertFanSchema.partial().required({ id: true });

export type InsertFan = z.input<typeof insertFanSchema>;
export type CreateFan = z.input<typeof createFanSchema>;
export type UpdateFan = z.input<typeof updateFanSchema>;
export type Fan = InferSelectModel<typeof Fans>;
