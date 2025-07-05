import type { InferSelectModel } from 'drizzle-orm';
import type { z } from 'zod/v4';
import { VisitorSessions } from '@barely/db/sql';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

export const insertVisitorSessionSchema = createInsertSchema(VisitorSessions);
export const createVisitorSessionSchema = insertVisitorSessionSchema.omit({
	id: true,
});
export const updateVisitorSessionSchema = insertVisitorSessionSchema
	.partial()
	.required({ id: true });
export const upsertVisitorSessionSchema = insertVisitorSessionSchema.partial({
	id: true,
});
export const selectVisitorSessionSchema = createSelectSchema(VisitorSessions);

export type VisitorSession = InferSelectModel<typeof VisitorSessions>;
export type CreateVisitorSession = z.infer<typeof createVisitorSessionSchema>;
export type UpdateVisitorSession = z.infer<typeof updateVisitorSessionSchema>;
export type UpsertVisitorSession = z.infer<typeof upsertVisitorSessionSchema>;

//
