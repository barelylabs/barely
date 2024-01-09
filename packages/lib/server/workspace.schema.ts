import { InferModel } from 'drizzle-orm';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

import { Workspaces } from './workspace.sql';

export const insertWorkspaceSchema = createInsertSchema(Workspaces, {
	name: z.string().min(3, 'Your workspace name must be at least 3 characters long'),
	handle: z
		.string()
		.min(3, 'Your workspace handle must be at least 3 characters long')
		.max(32, 'Your workspace handle must be no more than 32 characters long')
		.regex(
			/^[a-zA-Z][a-zA-Z0-9-_]*$/,
			'Your workspace handle must start with a letter and can only contain letters, numbers, dashes, and underscores',
		),
});
export const createWorkspaceSchema = insertWorkspaceSchema.omit({ id: true });

export const updateWorkspaceSchema = insertWorkspaceSchema
	.partial()
	.required({ id: true });
export const upsertWorkspaceSchema = insertWorkspaceSchema.partial({ id: true });
export const selectWorkspaceSchema = createSelectSchema(Workspaces);

export type Workspace = InferModel<typeof Workspaces>;
export type InsertWorkspace = z.infer<typeof insertWorkspaceSchema>;
export type CreateWorkspace = z.infer<typeof createWorkspaceSchema>;
export type UpdateWorkspace = z.infer<typeof updateWorkspaceSchema>;
export type UpsertWorkspace = z.infer<typeof upsertWorkspaceSchema>;
export type SelectWorkspace = z.infer<typeof selectWorkspaceSchema>;

// forms
export const workspaceTypeSchema = insertWorkspaceSchema.shape.type.unwrap();