import type { InferSelectModel } from 'drizzle-orm';
import { createInsertSchema } from 'drizzle-zod';
// eslint-disable-next-line no-restricted-imports
import * as zv3 from 'zod';
import { z } from 'zod/v4';

import { querySelectionSchema } from '../../../utils/zod-helpers';
import { Fans } from './fan.sql';

export const insertFanSchema = createInsertSchema(Fans);
export const createFanSchema = insertFanSchema.omit({ id: true, workspaceId: true });
export const updateFanSchema = insertFanSchema.partial().required({ id: true });
export const upsertFanSchema = insertFanSchema.partial({
	id: true,
	workspaceId: true,
});

export type InsertFan = z.input<typeof insertFanSchema>;
export type CreateFan = z.input<typeof createFanSchema>;
export type UpsertFan = z.input<typeof upsertFanSchema>;
export type UpdateFan = z.input<typeof updateFanSchema>;
export type Fan = InferSelectModel<typeof Fans>;
export type FanForEmail = Pick<
	Fan,
	'id' | 'email' | 'firstName' | 'lastName' | 'fullName'
>;

// forms
export const fanFilterParamsSchema = z.object({
	search: z.string().optional(),
	showArchived: z.boolean().optional(),
});
export const fanSearchParamsSchema = fanFilterParamsSchema.extend({
	selectedFanIds: querySelectionSchema.optional(),
});

export const selectWorkspaceFansSchema = fanFilterParamsSchema.extend({
	// handle: z.string(),
	cursor: z.object({ id: z.string(), createdAt: z.coerce.date() }).optional(),
	limit: z.coerce.number().min(1).max(100).optional().default(20),
});

export const defaultFan: CreateFan = {
	fullName: '',
	email: '',
};

// fixme: we're using zv3 here because ai v4 doesn't support zod v4 yet. v5 is in alpha but not playing nice with the @ai-sdk/anthropic in alpha. We can fix once v5 ai is released.
export const importFansFromCsvColumnMappingsSchema_zodv3 = zv3.object({
	firstName: zv3.string().optional().describe('The first name (firstName) of the fan'),
	lastName: zv3.string().optional().describe('The last name (lastName) of the fan'),
	fullName: zv3.string().optional().describe('The full name (fullName) of the fan'),
	email: zv3.string().describe('The email address of the fan'),
	phoneNumber: zv3
		.string()
		.optional()
		.describe('The phone number (phoneNumber) of the fan'),
	createdAt: zv3.string().describe('The date and time the fan was created (createdAt)'),
});

export const importFansFromCsvColumnMappingsSchema_zodv4 = z.object({
	firstName: z.string().optional().describe('The first name (firstName) of the fan'),
	lastName: z.string().optional().describe('The last name (lastName) of the fan'),
	fullName: z.string().optional().describe('The full name (fullName) of the fan'),
	email: z.string().describe('The email address of the fan'),
	phoneNumber: z
		.string()
		.optional()
		.describe('The phone number (phoneNumber) of the fan'),
	createdAt: z.string().describe('The date and time the fan was created (createdAt)'),
});

/* making this shallow b/c the SelectFieldOption type inference currently only works one level deep
I'd prefer to fix that and go back to having a nested columnMappings object */
export const importFansFromCsvSchema = importFansFromCsvColumnMappingsSchema_zodv4.extend(
	{
		csvFileId: z.string(),
		// columnMappings: importFansFromCsvColumnMappingsSchema,
		optIntoEmailMarketing: z.boolean(),
		optIntoSmsMarketing: z.boolean(),
	},
);
