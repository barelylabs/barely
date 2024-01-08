import { InferModel } from 'drizzle-orm';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

import { VisitorSessions } from './visitor-session.sql';

export const insertVisitorSessionSchema = createInsertSchema(VisitorSessions);
export const createVisitorSessionSchema = insertVisitorSessionSchema.omit({ id: true });
export const updateVisitorSessionSchema = insertVisitorSessionSchema
	.partial()
	.required({ id: true });
export const upsertVisitorSessionSchema = insertVisitorSessionSchema.partial({
	id: true,
});
export const selectVisitorSessionSchema = createSelectSchema(VisitorSessions);

export type VisitorSession = InferModel<typeof VisitorSessions, 'select'>;
export type CreateVisitorSession = z.infer<typeof createVisitorSessionSchema>;
export type UpdateVisitorSession = z.infer<typeof updateVisitorSessionSchema>;
export type UpsertVisitorSession = z.infer<typeof upsertVisitorSessionSchema>;

//
