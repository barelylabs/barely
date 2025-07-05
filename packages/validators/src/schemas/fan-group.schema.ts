import type { InferSelectModel } from 'drizzle-orm';
import { FanGroupConditions, FanGroups } from '@barely/db/sql';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod/v4';

import {
	commonFiltersSchema,
	infiniteQuerySchema,
	// optionalString_EmptyToUndefined,
	querySelectionSchema,
} from '../helpers';

// FanGroupConditions
export const insertFanGroupConditionSchema = createInsertSchema(FanGroupConditions, {
	// productId: optionalString_EmptyToUndefined,
	// cartFunnelId: optionalString_EmptyToUndefined,
	productId: z
		.string()
		.transform(v => (v === '' ? undefined : v))
		.optional(),
	cartFunnelId: z
		.string()
		.transform(v => (v === '' ? undefined : v))
		.optional(),
});
export const createFanGroupConditionSchema = insertFanGroupConditionSchema
	.omit({
		id: true,
	})
	.partial({
		fanGroupId: true,
	});
export const upsertFanGroupConditionSchema = insertFanGroupConditionSchema.partial({
	id: true,
	fanGroupId: true,
});

export type InsertFanGroupCondition = z.input<typeof insertFanGroupConditionSchema>;
export type CreateFanGroupCondition = z.input<typeof createFanGroupConditionSchema>;
export type UpsertFanGroupCondition = z.input<typeof upsertFanGroupConditionSchema>;
export type FanGroupCondition = InferSelectModel<typeof FanGroupConditions>;

// FanGroups
export const insertFanGroupSchema = createInsertSchema(FanGroups, {
	name: name => name.min(1, 'Name is required'),
});

export const createFanGroupSchema = insertFanGroupSchema
	.omit({ id: true, workspaceId: true })
	.extend({
		conditions: z.array(createFanGroupConditionSchema).optional(),
	});

export const upsertFanGroupSchema = insertFanGroupSchema
	.partial({
		id: true,
		workspaceId: true,
	})
	.extend({
		conditions: z.array(upsertFanGroupConditionSchema).optional(),
	});

export const updateFanGroupSchema = insertFanGroupSchema
	.partial()
	.required({ id: true })
	.extend({
		conditions: z.array(upsertFanGroupConditionSchema).optional(),
	});

export type InsertFanGroup = z.input<typeof insertFanGroupSchema>;
export type CreateFanGroup = z.input<typeof createFanGroupSchema>;
export type UpsertFanGroup = z.input<typeof upsertFanGroupSchema>;
export type UpdateFanGroup = z.input<typeof updateFanGroupSchema>;
export type FanGroup = InferSelectModel<typeof FanGroups>;
export type FanGroupWithConditions = InferSelectModel<typeof FanGroups> & {
	conditions: FanGroupCondition[];
};

// forms
export const fanGroupFilterParamsSchema = commonFiltersSchema;
export const fanGroupSearchParamsSchema = fanGroupFilterParamsSchema.extend({
	selectedFanGroupIds: querySelectionSchema.optional(),
});

export const selectWorkspaceFanGroupsSchema =
	fanGroupFilterParamsSchema.merge(infiniteQuerySchema);

export const defaultFanGroup: CreateFanGroup = {
	name: '',
	description: '',
	conditions: [],
};
