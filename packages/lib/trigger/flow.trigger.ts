import { sendEmail } from '@barely/email';
import { logger, task, wait } from '@trigger.dev/sdk/v3';
import { and, eq, isNotNull, sql } from 'drizzle-orm';

import type { FlowAction } from '../server/routes/flow/flow.schema';
// import { env } from '../env';
// import { renderMarkdownToReactEmail } from '../../email/email.mdx';
import { dbHttp } from '../server/db';
import { addToMailchimpAudience } from '../server/mailchimp/mailchimp.endpts.audiences';
import { Carts } from '../server/routes/cart/cart.sql';
import { renderMarkdownToReactEmail } from '../server/routes/email/email.mdx';
import { EmailDeliveries, EmailTemplates } from '../server/routes/email/email.sql';
import { getEmailAddressFromEmailAddress } from '../server/routes/email/email.utils';
import { Fans } from '../server/routes/fan/fan.sql';
import { Flow_Runs, FlowRunActions, Flows } from '../server/routes/flow/flow.sql';
import { ProviderAccounts } from '../server/routes/provider-account/provider-account.sql';
import { Workspaces } from '../server/routes/workspace/workspace.sql';
import { newId } from '../utils/id';
import { parseFullName } from '../utils/name';
import { raise } from '../utils/raise';
import { sqlAnd, sqlIncrement } from '../utils/sql';

interface HandleFlowPayload {
	flowId: string;
	// possible trigger event data
	fanId?: string;
	cartOrderId?: string;
}

export const handleFlow = task({
	id: 'handle-flow',
	run: async (payload: HandleFlowPayload) => {
		const { fanId, flowId } = payload;

		// console.log('db pool url >> ', env.DATABASE_POOL_URL);

		/* find flow */
		const flow = await dbHttp.query.Flows.findFirst({
			where: eq(Flows.id, payload.flowId),
			columns: {
				workspaceId: true,
				edges: true,
			},
			with: {
				triggers: true,
				actions: true,
			},
		});

		logger.info(`flow ${flowId} found`);

		if (!flow) return logger.error(`no flow found with id ${flowId}`);

		const { workspaceId, triggers } = flow;

		const triggerId = triggers[0]?.id;
		if (!triggerId) return logger.error(`no trigger found for flow ${flowId}`);

		/* first action */
		const firstActionRes = await getNextAction({
			flowId,
			currentNodeId: triggerId,
		});

		if (!firstActionRes) return logger.error(`no first action found for flow ${flowId}`);

		let currentAction: typeof firstActionRes.action | null = firstActionRes.action;

		const flowRunId = newId('flowRun');

		await dbHttp.insert(Flow_Runs).values({
			id: flowRunId,
			flowId,
			triggerId,
			triggerFanId: fanId,
			status: 'pending',
			currentActionNodeId: currentAction.id,
		});

		while (currentAction) {
			const { nextAction } = await handleAction({
				action: currentAction,
				workspaceId,
				fanId,
				flowRunId,
			});

			currentAction = nextAction ? nextAction.action : null;
		}

		await dbHttp
			.update(Flow_Runs)
			.set({ status: 'completed', currentActionNodeId: null })
			.where(eq(Flow_Runs.id, flowRunId));

		logger.info(`flow ${flowId} completed`);
	},
});

async function getNextAction({
	flowId,
	currentNodeId,
	booleanCondition,
}: {
	flowId: string;
	currentNodeId: string;
	booleanCondition?: boolean;
}) {
	const flow = await dbHttp.query.Flows.findFirst({
		where: eq(Flows.id, flowId),
		columns: {
			edges: true,
		},
		with: {
			actions: true,
		},
	});

	if (!flow) {
		logger.error(`no flow found with id ${flowId}`);
		return null;
	}

	const edgesFromCurrentNode = flow?.edges?.filter(edge => edge.source === currentNodeId);

	if (!edgesFromCurrentNode?.length) {
		logger.error(`no edges found for node ${currentNodeId}`);
		return null;
	}

	/* simple edge */
	if (edgesFromCurrentNode.length === 1) {
		const currentEdge = edgesFromCurrentNode[0];

		if (!currentEdge) {
			logger.error(`no edge found for node ${currentNodeId}`);
			return null;
		}

		if (currentEdge.type !== 'simple') {
			logger.error(`edge type ${currentEdge.type} not supported`);
			return null;
		}

		const nextNodeId = currentEdge.target;
		const nextNode = flow.actions.find(action => action.id === nextNodeId);

		if (!nextNode) {
			logger.error(`no action found for node ${nextNodeId}`);
			return null;
		}

		return {
			action: nextNode,
		};
	}

	/* boolean edge */
	if (edgesFromCurrentNode.length === 2) {
		const isBooleanDecision = edgesFromCurrentNode.every(edge => edge.type === 'boolean');

		if (!isBooleanDecision) {
			logger.error(
				`more than one edge coming from node ${currentNodeId}, but not all are boolean`,
			);
			return null;
		}

		if (booleanCondition === undefined) {
			logger.error(`boolean condition not provided for node ${currentNodeId}`);
			return null;
		}

		const nextNodeId = edgesFromCurrentNode.find(
			edge => edge.data?.boolean === booleanCondition,
		)?.target;

		if (!nextNodeId) {
			logger.error(
				`no next node found for boolean condition ${booleanCondition} for node ${currentNodeId}`,
			);
			return null;
		}

		const nextNode = flow.actions.find(action => action.id === nextNodeId);

		if (!nextNode) {
			logger.error(`no action found for node ${nextNodeId}`);
			return null;
		}

		return {
			action: nextNode,
		};
	}

	return null;
}

async function handleAction({
	action,
	flowRunId,
	fanId,
	workspaceId,
}: {
	action: FlowAction;
	flowRunId: string;
	workspaceId: string;
	fanId?: string;
}) {
	const flowRunActionId = newId('flowRunAction');

	await dbHttp
		.update(Flow_Runs)
		.set({ currentActionNodeId: action.id })
		.where(eq(Flow_Runs.id, flowRunId));

	await dbHttp.insert(FlowRunActions).values({
		id: flowRunActionId,
		flowId: action.flowId,
		flowActionId: action.id,
		flowRunId,
		status: 'pending',
	});

	const fan =
		fanId ?
			await dbHttp.query.Fans.findFirst({
				where: eq(Fans.id, fanId),
			})
		:	null;

	switch (action.type) {
		case 'empty': {
			return { nextAction: null };
		}

		case 'boolean': {
			// todo: check condition and return booleanCondition

			if (!action.booleanCondition) {
				logger.error(`no boolean condition provided for action ${action.id}`);
				return { nextAction: null };
			}

			const booleanCondition = await checkBooleanCondition({
				fanId,
				action,
			});

			if (booleanCondition === 'error') {
				logger.error(`error checking boolean condition for action ${action.id}`);
				return { nextAction: null };
			}

			const nextAction = await getNextAction({
				flowId: action.flowId,
				currentNodeId: action.id,
				booleanCondition,
			});

			return { nextAction };
		}

		case 'wait': {
			const waitFor = action.waitFor;
			const units = action.waitForUnits;

			if (!waitFor || !units) {
				logger.error(`no wait time provided for action ${action.id}`);
				return {
					nextAction: null,
				};
			}

			await wait.for(
				units === 'minutes' ? { minutes: waitFor }
				: units === 'hours' ? { hours: waitFor }
				: units === 'days' ? { days: waitFor }
				: { weeks: waitFor },
			);

			await dbHttp
				.update(FlowRunActions)
				.set({ status: 'completed' })
				.where(eq(FlowRunActions.id, flowRunActionId));

			const nextAction = await getNextAction({
				flowId: action.flowId,
				currentNodeId: action.id,
			});

			return { nextAction };
		}

		case 'sendEmail': {
			if (!action.emailTemplateId) {
				logger.error(`no email template id provided for action ${action.id}`);
				return {
					nextAction: null,
				};
			}

			const emailTemplate = await dbHttp.query.EmailTemplates.findFirst({
				where: eq(EmailTemplates.id, action.emailTemplateId),
				with: {
					from: {
						with: {
							domain: true,
						},
					},
				},
			});

			if (!emailTemplate) {
				logger.error(`no email found with id ${action.emailTemplateId}`);
				return { nextAction: null };
			}

			if (!fan) {
				logger.error(`no fan found with id ${fanId}`);
				return { nextAction: null };
			}

			/* if fan has opted out of email marketing, skip to next action */
			if (!fan.emailMarketingOptIn) {
				logger.info(`fan ${fanId} has opted out of email marketing`);

				const nextAction = await getNextAction({
					flowId: action.flowId,
					currentNodeId: action.id,
				});

				await dbHttp
					.update(FlowRunActions)
					.set({
						status: 'skipped',
						skippedReason: 'fan has opted out of email marketing',
					})
					.where(eq(FlowRunActions.id, flowRunActionId));

				return { nextAction };
			}

			const { firstName, lastName } = parseFullName(fan.fullName);

			const { subject, reactBody } = await renderMarkdownToReactEmail({
				subject: emailTemplate.subject,
				body: emailTemplate.body,
				variables: {
					firstName,
					lastName,
				},
			});

			const res = await sendEmail({
				to: fan.email,
				bcc: 'adam+flow-monitoring@barely.io',
				from: getEmailAddressFromEmailAddress(emailTemplate.from),
				fromFriendlyName: emailTemplate.from.defaultFriendlyName ?? undefined,
				replyTo: emailTemplate.from.replyTo ?? undefined,
				subject,
				react: reactBody,
				type: 'marketing',
			});

			if (res.error) {
				const error = typeof res.error === 'string' ? res.error : res.error.message;
				logger.error(`error sending email for action ${action.id}: ${error}`);

				await dbHttp
					.update(FlowRunActions)
					.set({ status: 'failed', error })
					.where(eq(FlowRunActions.id, flowRunActionId));

				await dbHttp.insert(EmailDeliveries).values({
					id: newId('emailDelivery'),
					workspaceId: workspaceId,
					emailTemplateId: action.emailTemplateId,
					fanId: fan.id,
					status: 'failed',
					sentAt: new Date(),
				});
			} else {
				await dbHttp
					.update(FlowRunActions)
					.set({ status: 'completed' })
					.where(eq(FlowRunActions.id, flowRunActionId));

				await dbHttp.insert(EmailDeliveries).values({
					id: newId('emailDelivery'),
					workspaceId: workspaceId,
					emailTemplateId: action.emailTemplateId,
					fanId: fan.id,
					status: 'sent',
					sentAt: new Date(),
				});

				await dbHttp
					.update(Workspaces)
					.set({ emailUsage: sqlIncrement(Workspaces.emailUsage) })
					.where(eq(Workspaces.id, workspaceId));
			}

			const nextAction = await getNextAction({
				flowId: action.flowId,
				currentNodeId: action.id,
			});

			return { nextAction };
		}

		case 'addToMailchimpAudience': {
			if (!action.mailchimpAudienceId) {
				logger.error(`no mailchimp audience id provided for action ${action.id}`);
				return { nextAction: null };
			}

			if (!fan?.emailMarketingOptIn) {
				logger.info(`fan ${fanId} has opted out of email marketing`);

				const nextAction = await getNextAction({
					flowId: action.flowId,
					currentNodeId: action.id,
				});

				return { nextAction };
			}

			const mailchimpAudienceId =
				action.mailchimpAudienceId ??
				raise(`no mailchimp audience id provided for action ${action.id}`);

			const mailchimpAccount =
				(await dbHttp.query.ProviderAccounts.findFirst({
					where: and(
						eq(ProviderAccounts.provider, 'mailchimp'),
						eq(ProviderAccounts.workspaceId, workspaceId),
					),
				})) ?? raise(`no mailchimp account found for workspace ${workspaceId}`);

			// const flowRunAction: InsertFlowRunAction= {
			// 				id: newId('flowRunAction'),
			//                 flowId: action.flowId,
			// 				flowRunId: flowRunId,
			// 				flowActionId: action.id,
			// 				status: 'completed',
			// 			};

			try {
				await addToMailchimpAudience({
					accessToken:
						mailchimpAccount.access_token ??
						raise(`no access token found for mailchimp account ${mailchimpAccount.id}`),
					server:
						mailchimpAccount.server ??
						raise(`no server found for mailchimp account ${mailchimpAccount.id}`),
					listId: mailchimpAudienceId,
					fan,
				});

				await dbHttp
					.update(FlowRunActions)
					.set({ status: 'completed', completedAt: new Date() })
					.where(eq(FlowRunActions.id, flowRunActionId));

				return {
					nextAction: await getNextAction({
						flowId: action.flowId,
						currentNodeId: action.id,
					}),
				};
			} catch (error) {
				console.log(error);
				logger.error(
					`error adding fan ${fanId} to mailchimp audience ${mailchimpAudienceId}`,
				);
				await dbHttp
					.update(FlowRunActions)
					.set({
						status: 'failed',
						error: `error adding fan ${fanId} to mailchimp audience ${mailchimpAudienceId}`,
					})
					.where(eq(FlowRunActions.id, flowRunActionId));

				return { nextAction: null };
			}
		}
	}
}

async function checkBooleanCondition({
	fanId,
	action,
}: {
	fanId?: string;
	action: FlowAction;
}) {
	switch (action.booleanCondition) {
		case 'hasOrderedProduct': {
			if (!fanId) {
				logger.error(`no fan id provided for action ${action.id}`);
				return 'error';
			}

			const orders = await dbHttp.query.Carts.findMany({
				where: and(eq(Carts.fanId, fanId), isNotNull(Carts.checkoutConvertedAt)),
				with: {
					mainProduct: true,
					bumpProduct: true,
					upsellProduct: true,
				},
			});

			const orderedProductIds: string[] = [];

			orders.map(order => {
				orderedProductIds.push(order.mainProduct.id);
				order.addedBump &&
					order.bumpProduct &&
					orderedProductIds.push(order.bumpProduct.id);
				order.upsellConvertedAt &&
					order.upsellProduct &&
					orderedProductIds.push(order.upsellProduct.id);
			});

			if (!action.productId) {
				return orders.length > 0;
			}

			return orderedProductIds.includes(action.productId);
		}
		case 'hasOrderedCart': {
			if (!fanId) {
				logger.error(`no fan id provided for action ${action.id}`);
				return 'error';
			}

			const orders = await dbHttp.query.Carts.findMany({
				where: sqlAnd([
					eq(Carts.fanId, fanId),
					isNotNull(Carts.checkoutConvertedAt),
					!!action.cartFunnelId && eq(Carts.cartFunnelId, action.cartFunnelId),
				]),
			});

			return orders.length > 0;
		}
		case 'hasOrderedAmount': {
			if (!fanId) {
				logger.error(`no fan id provided for action ${action.id}`);
				return 'error';
			}

			if (!fanId) {
				logger.error(`no fan id provided for action ${action.id}`);
				return 'error';
			}

			if (typeof action.totalOrderAmount !== 'number') {
				logger.error(`Invalid amount specified for action ${action.id}`);
				return 'error';
			}

			const result = await dbHttp
				.select({
					totalAmount: sql<number>`sum(${Carts.orderAmount})`.mapWith(Number),
				})
				.from(Carts)
				.where(sqlAnd([eq(Carts.fanId, fanId), isNotNull(Carts.checkoutConvertedAt)]));

			const totalAmount = result[0]?.totalAmount ?? 0;

			return totalAmount >= action.totalOrderAmount;
		}
		case null:
			return 'error';
	}
}
