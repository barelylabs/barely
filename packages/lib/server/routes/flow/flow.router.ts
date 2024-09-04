import { tasks } from '@trigger.dev/sdk/v3';
import { TRPCError } from '@trpc/server';
import { and, asc, desc, eq, gt, lt, notInArray, or } from 'drizzle-orm';
import { z } from 'zod';

import type { handleFlow } from '../../../trigger/flow.trigger';
import type { InsertFlowAction, InsertFlowTrigger } from './flow.schema';
import type { BooleanEdge, FlowEdge, FlowNode, SimpleEdge } from './flow.ui.types';
import { newId } from '../../../utils/id';
import { raise } from '../../../utils/raise';
import { sqlAnd, sqlCount, sqlStringContains } from '../../../utils/sql';
import {
	createTRPCRouter,
	privateProcedure,
	workspaceQueryProcedure,
} from '../../api/trpc';
import { EmailTemplates } from '../email/email.sql';
import { selectWorkspaceFlowsSchema, updateFlowAndNodesSchema } from './flow.schema';
import { Flow_Actions, Flow_Triggers, Flows } from './flow.sql';
import {
	getActionNodeFromFlowAction,
	getInsertableFlowActionsFromFlowActions,
	getTriggerNodeFromFlowTrigger,
} from './flow.utils';

export const flowRouter = createTRPCRouter({
	byWorkspace: workspaceQueryProcedure
		.input(selectWorkspaceFlowsSchema)
		.query(async ({ input, ctx }) => {
			const { limit, cursor, search } = input;
			const flows = await ctx.db.http.query.Flows.findMany({
				where: sqlAnd([
					eq(Flows.workspaceId, ctx.workspace.id),
					!!search?.length && sqlStringContains(Flows.name, search),
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

	byId: privateProcedure
		.input(
			z.object({
				flowId: z.string(),
			}),
		)
		.query(async ({ input, ctx }) => {
			const { flowId } = input;
			const flow = await ctx.db.http.query.Flows.findFirst({
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

			const actionNodes: FlowNode[] = flow.actions.map(node => {
				return getActionNodeFromFlowAction(node, { x: 400, y: 25 });
			});

			const uiEdges: FlowEdge[] = flow.edges ?? [];
			const uiNodes: FlowNode[] = [triggerNode, ...actionNodes];

			return {
				flow,
				trigger,
				actions,

				uiEdges,
				uiNodes,
			};
		}),

	create: privateProcedure
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
					await ctx.db.pool
						.select({
							count: sqlCount,
						})
						.from(Flows)
						.where(eq(Flows.workspaceId, ctx.workspace.id))
				)[0]?.count ?? 0;

			await ctx.db.pool.insert(Flows).values({
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
			await ctx.db.pool.insert(Flow_Triggers).values({
				id: newFlowTriggerId,
				flowId: newFlowId,
				type: 'callFlow',
			});

			// create an empty action node
			await ctx.db.pool.insert(Flow_Actions).values({
				id: newFlowActionId,
				flowId: newFlowId,
				type: 'empty',
			});

			return {
				flowId: newFlowId,
			};
		}),

	update: privateProcedure
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

			await ctx.db.pool
				.update(Flows)
				.set({
					...flow,
					edges,
				})
				.where(and(eq(Flows.id, flow.id), eq(Flows.workspaceId, ctx.workspace.id)));

			// update the trigger
			await ctx.db.pool
				.update(Flow_Triggers)
				.set(trigger)
				.where(and(eq(Flow_Triggers.id, trigger.id), eq(Flow_Triggers.flowId, flow.id)));

			// update the actions (upsert). I think we need to map over each action to handle the upsert
			await Promise.all(
				actions.map(async action => {
					if (action.type === 'sendEmail') {
						const { id, ...emailTemplate } =
							action.emailTemplate ??
							raise(
								`No email template found for action ${action.id} in flowRouter.update`,
							);

						await ctx.db.pool
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

					await ctx.db.pool
						.insert(Flow_Actions)
						.values({
							id: actionId,
							...actionData,
						})
						.onConflictDoUpdate({
							target: [Flow_Actions.flowId, Flow_Actions.id],
							set: actionData,
						});
				}),
			);

			// remove the actions that are no longer in the list
			await ctx.db.pool.delete(Flow_Actions).where(
				and(
					eq(Flow_Actions.flowId, flow.id),
					notInArray(
						Flow_Actions.id,
						actions.map(a => a.id),
					),
				),
			);

			return {
				flowId: flow.id,
			};
		}),

	triggerTestFlow: privateProcedure
		.input(
			z.object({
				flowId: z.string(),
				fanId: z.string(),
			}),
		)
		.mutation(async ({ input }) => {
			const { flowId, fanId } = input;

			// await handleFlow.trigger({
			await tasks.trigger<typeof handleFlow>('handle-flow', {
				flowId,
				fanId,
			});
		}),
});
