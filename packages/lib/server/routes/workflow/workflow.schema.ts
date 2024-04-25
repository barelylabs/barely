import type { InferSelectModel } from 'drizzle-orm';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

import { queryStringArraySchema } from '../../../utils/zod-helpers';
import { WorkflowActions, Workflows, WorkflowTriggers } from './workflow.sql';

/** triggers */

export const insertWorkflowTriggerSchema = createInsertSchema(WorkflowTriggers);
export const createWorkflowTriggerSchema = insertWorkflowTriggerSchema.omit({
	id: true,
	workflowId: true,
});
export const upsertWorkflowTriggerSchema = insertWorkflowTriggerSchema.partial({
	id: true,
	workflowId: true,
	handle: true,
});

/** actions */
export const insertWorkflowActionSchema = createInsertSchema(WorkflowActions);
export const createWorkflowActionSchema = insertWorkflowActionSchema.omit({
	id: true,
	workflowId: true,
});
export const upsertWorkflowActionSchema = insertWorkflowActionSchema.partial({
	id: true,
	workflowId: true,
	handle: true,
});

/** workflows */
export const insertWorkflowSchema = createInsertSchema(Workflows, {
	name: s => s.name.min(1, 'Name is required'),
}).extend({
	triggers: z.array(createWorkflowTriggerSchema),
	actions: z.array(createWorkflowActionSchema),
});

export const createWorkflowSchema = insertWorkflowSchema.omit({
	id: true,
	workspaceId: true,
});

export const upsertWorkflowSchema = insertWorkflowSchema.partial({
	id: true,
	workspaceId: true,
	handle: true,
});

export const updateWorkflowSchema = insertWorkflowSchema
	.partial()
	.required({ id: true })
	.extend({
		triggers: z.array(upsertWorkflowTriggerSchema),
		actions: z.array(upsertWorkflowActionSchema),
	});

export type InsertWorkflow = z.infer<typeof insertWorkflowSchema>;
export type CreateWorkflow = z.infer<typeof createWorkflowSchema>;
export type UpsertWorkflow = z.infer<typeof upsertWorkflowSchema>;
export type UpdateWorkflow = z.infer<typeof updateWorkflowSchema>;
export type Workflow = InferSelectModel<typeof Workflows>;

export const selectWorkspaceWorkflowsSchema = z.object({
	handle: z.string(),
	search: z.string().optional(),
	showArchived: z.boolean().optional(),
	cursor: z.object({ id: z.string(), createdAt: z.string() }).optional(),
	limit: z.coerce.number().min(1).max(100).optional().default(20),
});

// forms
export const workflowFilterParamsSchema = z.object({
	search: z.string().optional(),
	showArchived: z.boolean().optional(),
});

export const workflowSearchParamsSchema = workflowFilterParamsSchema.extend({
	selectedWorkflowIds: queryStringArraySchema.optional(),
});

export const defaultWorkflow: CreateWorkflow = {
	name: '',
	description: '',
	triggers: [],
	actions: [],
};
