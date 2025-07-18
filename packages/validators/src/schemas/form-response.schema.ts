import type { InferModel } from 'drizzle-orm';
import type { z } from 'zod/v4';
import { FormResponses } from '@barely/db/sql';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

export const insertFormResponseSchema = createInsertSchema(FormResponses);
export const createFormResponseSchema = insertFormResponseSchema.omit({
	id: true,
});
export const updateFormResponseSchema = insertFormResponseSchema
	.partial()
	.required({ id: true });
export const upsertFormResponseSchema = insertFormResponseSchema.partial({
	id: true,
});
export const selectFormResponseSchema = createSelectSchema(FormResponses);

export type FormResponse = InferModel<typeof FormResponses, 'select'>;
export type CreateFormResponse = z.infer<typeof createFormResponseSchema>;
export type UpdateFormResponse = z.infer<typeof updateFormResponseSchema>;
export type UpsertFormResponse = z.infer<typeof upsertFormResponseSchema>;
export type SelectFormResponse = z.infer<typeof selectFormResponseSchema>;
