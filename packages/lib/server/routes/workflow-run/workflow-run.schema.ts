import type { z } from 'zod/v4';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

import type { Workflow, WorkflowAction } from '../workflow/workflow.schema';
import { WorkflowRunActions, WorkflowRuns } from '../workflow/workflow.sql';

export const insertWorkflowRunSchema = createInsertSchema(WorkflowRuns);
export const updateWorkflowRunSchema = insertWorkflowRunSchema
	.partial()
	.required({ id: true });
export const selectWorkflowRunSchema = createSelectSchema(WorkflowRuns);

export type InsertWorkflowRun = z.infer<typeof insertWorkflowRunSchema>;
export type UpdateWorkflowRun = z.infer<typeof updateWorkflowRunSchema>;
export type WorkflowRun = z.infer<typeof selectWorkflowRunSchema>;

/* actionRuns */
export const insertWorkflowRunActionSchema = createInsertSchema(WorkflowRunActions);
export const updateWorkflowRunActionSchema = insertWorkflowRunActionSchema
	.partial()
	.required({ id: true });
export const selectWorkflowRunActionSchema = createSelectSchema(WorkflowRunActions);

export type InsertWorkflowRunAction = z.infer<typeof insertWorkflowRunActionSchema>;
export type UpdateWorkflowRunAction = z.infer<typeof updateWorkflowRunActionSchema>;
export type WorkflowRunAction = z.infer<typeof selectWorkflowRunActionSchema>;

/* actionable */
export interface ActionalableWorkflowRun extends WorkflowRun {
	workflow: Workflow;
	currentAction: WorkflowAction;
}
