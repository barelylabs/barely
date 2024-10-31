import type { InferSelectModel } from 'drizzle-orm';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

import {
	optionalString_EmptyToUndefined,
	querySelectionSchema,
} from '../../../utils/zod-helpers';
import { FanGroupConditions, FanGroups } from './fan-group.sql';

// FanGroupConditions
export const insertFanGroupConditionSchema = createInsertSchema(FanGroupConditions, {
	productId: optionalString_EmptyToUndefined,
	cartFunnelId: optionalString_EmptyToUndefined,
});
export const createFanGroupConditionSchema = insertFanGroupConditionSchema
	.omit({
		id: true,
	})
	.partial({
		fanGroupId: true,
	});
// export const updateFanGroupConditionSchema = insertFanGroupConditionSchema
// 	.partial()
// 	.required({ id: true });
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
	name: s => s.name.min(1, 'Name is required'),
});

export const createFanGroupSchema = insertFanGroupSchema
	.omit({ id: true, workspaceId: true })
	.extend({
		conditions: z.array(createFanGroupConditionSchema),
	});

export const upsertFanGroupSchema = insertFanGroupSchema
	.partial({
		id: true,
		workspaceId: true,
	})
	.extend({
		conditions: z.array(upsertFanGroupConditionSchema),
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
export const fanGroupFilterParamsSchema = z.object({
	search: z.string().optional(),
	showArchived: z.boolean().optional(),
});
export const fanGroupSearchParamsSchema = fanGroupFilterParamsSchema.extend({
	selectedFanGroupIds: querySelectionSchema.optional(),
});

export const selectWorkspaceFanGroupsSchema = fanGroupFilterParamsSchema.extend({
	cursor: z.object({ id: z.string(), createdAt: z.coerce.date() }).optional(),
	limit: z.coerce.number().min(1).max(100).optional().default(20),
});

export const defaultFanGroup: CreateFanGroup = {
	name: '',
	description: '',
	conditions: [],
};
