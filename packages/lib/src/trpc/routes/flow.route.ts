import type {
	BooleanEdge,
	FlowEdge,
	FlowNode,
	InsertFlowAction,
	InsertFlowTrigger,
	SimpleEdge,
} from '@barely/validators';
import type { TRPCRouterRecord } from '@trpc/server';
import { dbHttp } from '@barely/db/client';
import { dbPool } from '@barely/db/pool';
import { EmailTemplates, Flow_Triggers, FlowActions, Flows } from '@barely/db/sql';
import { sqlAnd, sqlCount, sqlStringContains } from '@barely/db/utils';
import { newId, raise } from '@barely/utils';
import { selectWorkspaceFlowsSchema, updateFlowAndNodesSchema } from '@barely/validators';
import { tasks } from '@trigger.dev/sdk/v3';
import { TRPCError } from '@trpc/server';
import { and, asc, desc, eq, gt, lt, notInArray, or } from 'drizzle-orm';
import { z } from 'zod/v4';

import type { handleFlow } from '../../trigger';
import {
	getActionNodeFromFlowAction,
	getInsertableFlowActionsFromFlowActions,
	getTriggerNodeFromFlowTrigger,
} from '../../functions/flows/flow.utils';
import { workspaceProcedure } from '../trpc';

export const flowRoute = {
	byWorkspace: workspaceProcedure
		.input(selectWorkspaceFlowsSchema)
		.query(async ({ input, ctx }) => {
			const { limit, cursor, search } = input;
			const flows = await dbHttp.query.Flows.findMany({
				where: sqlAnd([
					eq(Flows.workspaceId, ctx.workspace.id),
					!!search.length && sqlStringContains(Flows.name, search),
					!!cursor &&
						or(
							lt(Flows.createdAt, cursor.createdAt),
							and(eq(Flows.createdAt, cursor.createdAt), gt(Flows.id, cursor.id)),
						),
				]),
				orderBy: [desc(Flows.createdAt), asc(Flows.id)],
				limit: limit + 1,
			});

			let nextCursor: typeof cursor | undefined = undefined;

			if (flows.length > limit) {
				const nextFlow = flows.pop();
				nextCursor =
					nextFlow ? { id: nextFlow.id, createdAt: nextFlow.createdAt } : undefined;
			}

			return {
				flows,
				nextCursor,
			};
		}),

	byId: workspaceProcedure
		.input(
			z.object({
				flowId: z.string(),
			}),
		)
		.query(async ({ input, ctx }) => {
			const { flowId } = input;
			const flow = await dbHttp.query.Flows.findFirst({
				where: and(eq(Flows.id, flowId), eq(Flows.workspaceId, ctx.workspace.id)),
				with: {
					triggers: true,
					actions: {
						with: {
							emailTemplate: true,
						},
					},
				},
			});

			if (!flow) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'Flow not found',
				});
			}

			const trigger: InsertFlowTrigger =
				flow.triggers[0] ?? raise(`No trigger found for flow ${flowId}`);
			const triggerNode = getTriggerNodeFromFlowTrigger(trigger, { x: 400, y: 25 });

			const actions: InsertFlowAction[] = getInsertableFlowActionsFromFlowActions(
				flow.actions,
			);

			const actionNodes: FlowNode[] = actions.map(node => {
				return getActionNodeFromFlowAction(node, { x: 400, y: 25 });
			});

			const uiEdges: FlowEdge[] = flow.edges;
			const uiNodes: FlowNode[] = [triggerNode, ...actionNodes];

			return {
				flow,
				trigger,
				actions,

				uiEdges,
				uiNodes,
			};
		}),

	create: workspaceProcedure
		.input(
			z.object({
				template: z.string().optional(),
			}),
		)
		.mutation(async ({ ctx }) => {
			// const {template} = input

			// create a default flow
			const newFlowId = newId('flow');
			const newFlowTriggerId = newId('flowTrigger');
			const newFlowActionId = newId('flowAction');

			const totalFlowsCount =
				(
					await dbPool(ctx.pool)
						.select({
							count: sqlCount,
						})
						.from(Flows)
						.where(eq(Flows.workspaceId, ctx.workspace.id))
				)[0]?.count ?? 0;

			await dbPool(ctx.pool)
				.insert(Flows)
				.values({
					id: newFlowId,
					workspaceId: ctx.workspace.id,
					name: `Flow ${totalFlowsCount + 1}`,
					description: 'A new flow',
					edges: [
						{
							id: `${newFlowTriggerId}-${newFlowActionId}`,
							source: newFlowTriggerId,
							target: newFlowActionId,
							deletable: false,
							type: 'simple',
						},
					],
				});

			// create a trigger node
			await dbPool(ctx.pool).insert(Flow_Triggers).values({
				workspaceId: ctx.workspace.id,
				id: newFlowTriggerId,
				flowId: newFlowId,
				type: 'callFlow',
			});

			// create an empty action node
			await dbPool(ctx.pool).insert(FlowActions).values({
				id: newFlowActionId,
				flowId: newFlowId,
				type: 'empty',
			});

			return {
				flowId: newFlowId,
			};
		}),

	update: workspaceProcedure
		.input(updateFlowAndNodesSchema)
		.mutation(async ({ ctx, input }) => {
			const { trigger, actions, ...flow } = input;

			const edges = flow.edges.map(edge => {
				switch (edge.type) {
					case 'boolean':
						return {
							...edge,
							type: 'boolean',
							data: {
								boolean:
									edge.data?.boolean ?? raise(`No boolean found for edge ${edge.id}`),
							},
						} satisfies BooleanEdge;
					case 'simple':
						return {
							...edge,
							type: 'simple',
						} satisfies SimpleEdge;
					default:
						throw new Error(`Unknown edge type`);
				}
			});

			await dbPool(ctx.pool)
				.update(Flows)
				.set({
					...flow,
					edges,
				})
				.where(and(eq(Flows.id, flow.id), eq(Flows.workspaceId, ctx.workspace.id)));

			// update the trigger
			await dbPool(ctx.pool)
				.update(Flow_Triggers)
				.set({ ...trigger, workspaceId: ctx.workspace.id })
				.where(and(eq(Flow_Triggers.id, trigger.id), eq(Flow_Triggers.flowId, flow.id)));

			// update the actions (upsert). I think we need to map over each action to handle the upsert
			await Promise.all(
				actions.map(async action => {
					if (action.type === 'sendEmail') {
						const { id, ...emailTemplate } = action.emailTemplate;

						await dbPool(ctx.pool)
							.insert(EmailTemplates)
							.values({
								id,
								...emailTemplate,
								workspaceId: ctx.workspace.id,
							})
							.onConflictDoUpdate({
								target: EmailTemplates.id,
								set: emailTemplate,
							});
					}

					const { id: actionId, ...actionData } = action;

					await dbPool(ctx.pool)
						.insert(FlowActions)
						.values({
							id: actionId,
							...actionData,
						})
						.onConflictDoUpdate({
							target: [FlowActions.flowId, FlowActions.id],
							set: actionData,
						});
				}),
			);

			// remove the actions that are no longer in the list
			await dbPool(ctx.pool)
				.delete(FlowActions)
				.where(
					and(
						eq(FlowActions.flowId, flow.id),
						notInArray(
							FlowActions.id,
							actions.map(a => a.id),
						),
					),
				);

			return {
				flowId: flow.id,
			};
		}),

	triggerTestFlow: workspaceProcedure
		.input(
			z.object({
				flowId: z.string(),
				fanId: z.string(),
				cartId: z.string().optional(),
			}),
		)
		.mutation(async ({ input }) => {
			const { flowId, fanId, cartId } = input;

			// find a trigger for this flow. we'll need to refactor this when we add more triggers 🤷‍♂️
			const trigger = await dbHttp.query.Flow_Triggers.findFirst({
				where: eq(Flow_Triggers.flowId, flowId),
			});

			if (!trigger)
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'Trigger not found',
				});

			await tasks.trigger<typeof handleFlow>('handle-flow', {
				triggerId: trigger.id,
				fanId,
				cartId,
			});
		}),
} satisfies TRPCRouterRecord;
