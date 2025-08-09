import type { InferSelectModel } from 'drizzle-orm';
import { VipSwapAccessLogs, VipSwaps } from '@barely/db/sql';
import { createInsertSchema, createUpdateSchema } from 'drizzle-zod';
import { z } from 'zod/v4';

import {
	commonFiltersSchema,
	infiniteQuerySchema,
	platformFiltersSchema,
	querySelectionSchema,
} from '../helpers';
import { stdWebEventPipeQueryParamsSchema } from './tb.schema';

// Base VIP Swap schema with validation
export const insertVipSwapSchema = createInsertSchema(VipSwaps, {
	name: z.string().min(1, 'Name is required'),
	key: z.string().min(4, 'Key must be at least 4   characters'),
	downloadLimit: z.number().min(1, 'Download limit must be at least 1').nullable(),
});
export const createVipSwapSchema = insertVipSwapSchema.omit({
	id: true,
	workspaceId: true,
});
export const upsertVipSwapSchema = insertVipSwapSchema.partial({
	id: true,
	workspaceId: true,
});

export const updateVipSwapSchema = createUpdateSchema(VipSwaps, {
	name: z.string().min(1, 'Name is required').optional(),
	key: z.string().min(4, 'Key must be at least 4 characters').optional(),
	downloadLimit: z
		.number()
		.min(1, 'Download limit must be at least 1')
		.nullable()
		.optional(),
}).required({
	id: true,
});

export type InsertVipSwap = z.infer<typeof insertVipSwapSchema>;
export type CreateVipSwap = z.infer<typeof createVipSwapSchema>;
export type UpsertVipSwap = z.infer<typeof upsertVipSwapSchema>;
export type UpdateVipSwap = z.infer<typeof updateVipSwapSchema>;
export type VipSwap = InferSelectModel<typeof VipSwaps>;

// VIP Swap filter schema
export const vipSwapFilterSchema = commonFiltersSchema;
export const vipSwapSearchParamsSchema = vipSwapFilterSchema.extend({
	selectedIds: querySelectionSchema.optional(),
});
export const selectWorkspaceVipSwapsSchema = vipSwapSearchParamsSchema.extend(
	infiniteQuerySchema.shape,
);

// Access type enum
export const vipAccessTypeEnum = z.enum(['download', 'email_sent', 'page_view']);

// VIP Swap Access Log schema
export const insertVipSwapAccessLogSchema = createInsertSchema(VipSwapAccessLogs);
export const createVipSwapAccessLogSchema = insertVipSwapAccessLogSchema.omit({
	id: true,
});
export const updateVipSwapAccessLogSchema = createUpdateSchema(VipSwapAccessLogs);

export type InsertVipSwapAccessLog = z.infer<typeof insertVipSwapAccessLogSchema>;
export type CreateVipSwapAccessLog = z.infer<typeof createVipSwapAccessLogSchema>;
export type UpdateVipSwapAccessLog = z.infer<typeof updateVipSwapAccessLogSchema>;
export type VipSwapAccessLog = InferSelectModel<typeof VipSwapAccessLogs>;

// VIP swap download request schema (for API endpoint)
export const vipSwapDownloadRequestSchema = z.object({
	handle: z.string().min(1),
	key: z.string().min(1),
	email: z.email(),
	// UTM parameters
	utm_source: z.string().optional(),
	utm_medium: z.string().optional(),
	utm_campaign: z.string().optional(),
	utm_term: z.string().optional(),
	utm_content: z.string().optional(),
});

// VIP swap download token validation schema
export const vipSwapDownloadTokenSchema = z.object({
	token: z.string().min(1),
});

// Types
export type VipAccessType = z.infer<typeof vipAccessTypeEnum>;
export type VipSwapDownloadRequest = z.infer<typeof vipSwapDownloadRequestSchema>;
export type VipSwapDownloadToken = z.infer<typeof vipSwapDownloadTokenSchema>;

// stat filters
export const vipStatFiltersSchema = stdWebEventPipeQueryParamsSchema.extend(
	platformFiltersSchema.shape,
);

export type VipStatFilters = z.infer<typeof vipStatFiltersSchema>;
