import {
	and,
	asc,
	desc,
	eq,
	gt,
	inArray,
	isNull,
	lt,
	notInArray,
	or,
	sql,
} from 'drizzle-orm';
import { z } from 'zod';

import { newId } from '../../../utils/id';
import { raise } from '../../../utils/raise';
import { sqlAnd, sqlStringContains } from '../../../utils/sql';
import {
	createTRPCRouter,
	privateProcedure,
	workspaceQueryProcedure,
} from '../../api/trpc';
import {
	createWorkflowSchema,
	selectWorkspaceWorkflowsSchema,
	updateWorkflowSchema,
} from './workflow.schema';
import { WorkflowActions, Workflows, WorkflowTriggers } from './workflow.sql';

export const workflowRouter = createTRPCRouter({
	byWorkspace: workspaceQueryProcedure
		.input(selectWorkspaceWorkflowsSchema)
		.query(async ({ ctx, input }) => {
			const { showArchived, showDeleted, limit, cursor, search } = input;

			const workflows = await ctx.db.http.query.Workflows.findMany({
				with: {
					triggers: {
						with: {
							cartFunnel: {
								columns: {
									id: true,
									name: true,
								},
							},
						},
					},
					actions: true,
				},
				where: sqlAnd([
					eq(Workflows.workspaceId, ctx.workspace.id),
					!!search?.length && sqlStringContains(Workflows.name, search),
					!!cursor &&
						or(
							lt(Workflows.createdAt, cursor.createdAt),
							and(eq(Workflows.createdAt, cursor.createdAt), gt(Workflows.id, cursor.id)),
						),
					!showArchived && eq(Workflows.archived, false),
					!showDeleted && isNull(Workflows.deletedAt),
				]),
				orderBy: [desc(Workflows.createdAt), asc(Workflows.id)],
				limit: limit + 1,
			});

			let nextCursor: typeof cursor | undefined = undefined;

			if (workflows.length > limit) {
				const nextWorkflow = workflows.pop();
				nextCursor =
					nextWorkflow ?
						{
							id: nextWorkflow.id,
							createdAt: nextWorkflow.createdAt,
						}
					:	undefined;
			}

			return {
				workflows: workflows.slice(0, limit),
				nextCursor,
			};
		}),

	create: privateProcedure
		.input(createWorkflowSchema)
		.mutation(async ({ ctx, input }) => {
			const workflowId = newId('workflow');

			const { triggers, actions, ...workflowData } = input;

			const workflow = await ctx.db.http
				.insert(Workflows)
				.values({
					id: workflowId,
					workspaceId: ctx.workspace.id,
					...workflowData,
				})
				.returning();

			if (triggers.length) {
				await ctx.db.http.insert(WorkflowTriggers).values(
					triggers.map(t => ({
						...t,
						id: newId('workflowTrigger'),
						workflowId,
					})),
				);
			}

			if (actions.length) {
				await ctx.db.http.insert(WorkflowActions).values(
					actions.map(a => ({
						...a,
						id: newId('workflowAction'),
						workflowId,
					})),
				);
			}

			return workflow[0] ?? raise('Failed to create workflow');
		}),

	update: privateProcedure
		.input(updateWorkflowSchema)
		.mutation(async ({ ctx, input }) => {
			const { id, triggers, actions, ...workflowData } = input;

			const workflow = await ctx.db.http
				.update(Workflows)
				.set(workflowData)
				.where(eq(Workflows.id, id))
				.returning();

			if (!triggers.length) {
				await ctx.db.http
					.delete(WorkflowTriggers)
					.where(eq(WorkflowTriggers.workflowId, id));
			} else {
				// delete any triggers that are not in the new list
				await ctx.db.http.delete(WorkflowTriggers).where(
					and(
						eq(WorkflowTriggers.workflowId, id),
						notInArray(
							WorkflowTriggers.id,
							triggers.map(t => t.id ?? ''),
						),
					),
				);

				await ctx.db.http
					.insert(WorkflowTriggers)
					.values(
						triggers.map(t => ({
							...t,

							id: newId('workflowTrigger'),
							workflowId: id,
						})),
					)
					.onConflictDoUpdate({
						target: [WorkflowTriggers.id],
						set: {
							trigger: sql`EXCLUDED.trigger`,
							cartFunnelId: sql`EXCLUDED.cartFunnelId`,
						},
					});
			}

			if (!actions.length) {
				await ctx.db.http
					.delete(WorkflowActions)
					.where(eq(WorkflowActions.workflowId, id));
			} else {
				// delete any actions that are not in the new list
				await ctx.db.http.delete(WorkflowActions).where(
					and(
						eq(WorkflowActions.workflowId, id),
						notInArray(
							WorkflowActions.id,
							actions.map(a => a.id ?? ''),
						),
					),
				);

				await ctx.db.http
					.insert(WorkflowActions)
					.values(
						actions.map(a => ({
							...a,
							id: newId('workflowAction'),
							workflowId: id,
						})),
					)
					.onConflictDoUpdate({
						target: [WorkflowActions.id],
						set: {
							action: sql`EXCLUDED.action`,
							lexorank: sql`EXCLUDED.lexorank`,
							mailchimpAudienceId: sql`EXCLUDED.mailchimpAudienceId`,
						},
					});
			}

			return workflow[0] ?? raise('Failed to update workflow');
		}),

	archive: privateProcedure
		.input(z.array(z.string()))
		.mutation(async ({ input, ctx }) => {
			const archivedWorkflows = await ctx.db.http
				.update(Workflows)
				.set({
					archived: true,
				})
				.where(
					and(eq(Workflows.workspaceId, ctx.workspace.id), inArray(Workflows.id, input)),
				)
				.returning();

			return archivedWorkflows[0] ?? raise('Failed to archive workflow');
		}),

	delete: privateProcedure.input(z.array(z.string())).mutation(async ({ input, ctx }) => {
		const deletedWorkflows = await ctx.db.http
			.update(Workflows)
			.set({
				deletedAt: new Date(),
			})
			.where(
				and(eq(Workflows.workspaceId, ctx.workspace.id), inArray(Workflows.id, input)),
			)
			.returning();

		return deletedWorkflows[0] ?? raise('Failed to delete workflow');
	}),
});
