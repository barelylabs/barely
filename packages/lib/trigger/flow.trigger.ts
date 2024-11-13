import { sendEmail } from '@barely/email';
import { neonConfig, Pool } from '@neondatabase/serverless';
import { logger, task, wait } from '@trigger.dev/sdk/v3';
import { and, asc, eq, inArray, isNotNull, sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from 'ws';

import type { DbPool } from '../server/db/pool';
import type { EmailTemplateWithFrom } from '../server/routes/email-template/email-template.schema';
import type { Fan } from '../server/routes/fan/fan.schema';
import type { FlowAction } from '../server/routes/flow/flow.schema';
import { env } from '../env';
import { dbSchema } from '../server/db';
import { addToMailchimpAudience } from '../server/mailchimp/mailchimp.endpts.audiences';
import { getAssetsFromMdx } from '../server/mdx/mdx.fns';
import { Carts } from '../server/routes/cart/cart.sql';
import { EmailDeliveries } from '../server/routes/email-delivery/email-delivery.sql';
import { renderMarkdownToReactEmail } from '../server/routes/email-template/email-template.mdx';
import {
	_EmailTemplates_To_EmailTemplateGroups,
	EmailTemplateGroups,
	EmailTemplates,
} from '../server/routes/email-template/email-template.sql';
import { Fans } from '../server/routes/fan/fan.sql';
import {
	Flow_Runs,
	Flow_Triggers,
	FlowRunActions,
	Flows,
} from '../server/routes/flow/flow.sql';
import { ProviderAccounts } from '../server/routes/provider-account/provider-account.sql';
import { Workspaces } from '../server/routes/workspace/workspace.sql';
import { getEmailAddressFromEmailAddress } from '../utils/email';
import { newId } from '../utils/id';
import { parseFullName } from '../utils/name';
import { raise } from '../utils/raise';
import { sqlAnd, sqlIncrement } from '../utils/sql';
import { getAbsoluteUrl } from '../utils/url';

neonConfig.webSocketConstructor = ws;

let pool: Pool | null = null;
let dbPool: DbPool | null = null;

const getPool = () => {
	if (!pool) {
		pool = new Pool({ connectionString: env.DATABASE_POOL_URL });
	}
	return pool;
};

const getDbPool = () => {
	if (!dbPool) {
		dbPool = drizzle(getPool(), { schema: dbSchema });
	}
	return dbPool;
};

const cleanUpDbPool = async () => {
	if (pool) {
		await pool.end();
	}
	pool = null;
	dbPool = null;
};

interface HandleFlowPayload {
	triggerId: string;
	fanId?: string;
	cartId?: string;
}

export const handleFlow = task({
	id: 'handle-flow',
	machine: {
		preset: 'medium-2x',
	},
	run: async (payload: HandleFlowPayload) => {
		const { triggerId, fanId, cartId } = payload;

		/* find flow */
		const trigger = await getDbPool().query.Flow_Triggers.findFirst({
			where: eq(Flow_Triggers.id, triggerId),
			with: {
				flow: {
					columns: {
						id: true,
						workspaceId: true,
						edges: true,
						enabled: true,
						paused: true,
					},
					with: {
						actions: true,
					},
				},
			},
		});

		if (!trigger) return logger.error(`no trigger found with id ${triggerId}`);
		if (!trigger.enabled) return logger.info(`trigger ${triggerId} is disabled`);

		const { flow, type } = trigger;

		if (!flow) return logger.error(`no flow found for trigger ${triggerId}`);

		if (type === 'newFan') {
			if (!fanId) return logger.error(`no fan id provided for trigger ${triggerId}`);

			const flowRuns = await getDbPool().query.Flow_Runs.findMany({
				where: and(eq(Flow_Runs.flowId, flow.id), eq(Flow_Runs.triggerFanId, fanId)),
			});

			if (flowRuns.length && flowRuns.every(fr => fr.status === 'completed'))
				return logger.info(`flow ${flow.id} already ran for fan ${fanId}`);

			// todo: we might want to wait on this one in case a more specific flow runs first
			// in that case, we could have an option to bypass if more specific flow has already ran
		} else if (type === 'newCartOrder') {
			if (!cartId) return logger.error(`no cart id provided for trigger ${triggerId}`);

			const flowRuns = await getDbPool().query.Flow_Runs.findMany({
				where: and(eq(Flow_Runs.flowId, flow.id), eq(Flow_Runs.triggerCartId, cartId)),
			});

			if (flowRuns.length && flowRuns.every(fr => fr.status === 'completed'))
				return logger.info(`flow ${flow.id} already ran for cart ${cartId}`);
		}

		const { workspaceId, enabled } = flow;

		if (!enabled) return logger.info(`flow ${flow.id} is disabled`);

		/* first action */
		const firstActionRes = await getNextAction({
			flowId: flow.id,
			currentNodeId: triggerId,
		});

		if (!firstActionRes) return logger.error(`no first action found for flow ${flow.id}`);

		const flowRunId = newId('flowRun');
		const firstAction = firstActionRes.nextAction;

		if (firstAction) {
			await getDbPool().insert(Flow_Runs).values({
				id: flowRunId,
				flowId: flow.id,
				triggerId,
				triggerFanId: fanId,
				triggerCartId: cartId,
				status: 'pending',
				currentActionNodeId: firstAction.id,
			});
		}

		let currentAction: FlowAction | null = firstActionRes.nextAction;

		while (currentAction) {
			logger.info('currentAction', currentAction);
			const { nextAction } = await handleAction({
				action: currentAction,
				workspaceId,
				fanId,
				flowRunId,
			});

			currentAction = nextAction ? nextAction : null;
		}

		await getDbPool()
			.update(Flow_Runs)
			.set({ status: 'completed', currentActionNodeId: null })
			.where(eq(Flow_Runs.id, flowRunId));

		logger.info(`flow ${flow.id} completed`);
	},
});

async function getNextAction({
	flowId,
	currentNodeId,
	booleanCondition,
	// dbPool,
}: {
	flowId: string;
	currentNodeId: string;
	booleanCondition?: boolean;
	// dbPool: DbPool;
}): Promise<{
	nextAction: FlowAction | null;
}> {
	const flow = await getDbPool().query.Flows.findFirst({
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
		return { nextAction: null };
	}

	const edgesFromCurrentNode = flow?.edges?.filter(edge => edge.source === currentNodeId);

	if (!edgesFromCurrentNode?.length) {
		logger.error(`no edges found for node ${currentNodeId}`);
		return { nextAction: null };
	}

	/* simple edge */
	if (edgesFromCurrentNode.length === 1) {
		const currentEdge = edgesFromCurrentNode[0];

		if (!currentEdge) {
			logger.error(`no edge found for node ${currentNodeId}`);
			return { nextAction: null };
		}

		if (currentEdge.type !== 'simple') {
			logger.error(`edge type ${currentEdge.type} not supported`);
			return { nextAction: null };
		}

		const nextNodeId = currentEdge.target;
		const nextNode = flow.actions.find(action => action.id === nextNodeId);

		if (!nextNode) {
			logger.error(`no action found for node ${nextNodeId}`);
			return { nextAction: null };
		}

		return {
			nextAction: nextNode,
		};
	}

	if (edgesFromCurrentNode.length === 2) {
		/* boolean edge */
		const isBooleanDecision = edgesFromCurrentNode.every(edge => edge.type === 'boolean');

		if (!isBooleanDecision) {
			logger.error(
				`more than one edge coming from node ${currentNodeId}, but not all are boolean`,
			);
			return { nextAction: null };
		}

		if (booleanCondition === undefined) {
			logger.error(`boolean condition not provided for node ${currentNodeId}`);
			return { nextAction: null };
		}

		const nextNodeId = edgesFromCurrentNode.find(
			edge => edge.data?.boolean === booleanCondition,
		)?.target;

		if (!nextNodeId) {
			logger.error(
				`no next node found for boolean condition ${booleanCondition} for node ${currentNodeId}`,
			);
			return { nextAction: null };
		}

		const nextNode = flow.actions.find(action => action.id === nextNodeId);

		if (!nextNode) {
			logger.error(`no action found for node ${nextNodeId}`);
			return { nextAction: null };
		}

		return {
			nextAction: nextNode,
		};
	}

	return { nextAction: null };
}

async function handleAction({
	action,
	flowRunId,
	fanId,
	workspaceId,
	// dbPool,
}: {
	action: FlowAction;
	flowRunId: string;
	workspaceId: string;
	fanId?: string;
	// dbPool: DbPool;
}): Promise<{
	nextAction: FlowAction | null;
	// dbPool: DbPool;
}> {
	const flowRunActionId = newId('flowRunAction');

	await getDbPool()
		.update(Flow_Runs)
		.set({ currentActionNodeId: action.id })
		.where(eq(Flow_Runs.id, flowRunId));

	await getDbPool().insert(FlowRunActions).values({
		id: flowRunActionId,
		flowId: action.flowId,
		flowActionId: action.id,
		flowRunId,
		status: 'pending',
	});

	const fan =
		fanId ?
			await getDbPool().query.Fans.findFirst({
				where: eq(Fans.id, fanId),
			})
		:	null;

	if (!action.enabled) {
		logger.info(`action ${action.id} is disabled`);

		const { nextAction } = await getNextAction({
			flowId: action.flowId,
			currentNodeId: action.id,
			// dbPool,
		});

		return { nextAction };
	}

	switch (action.type) {
		case 'empty': {
			return { nextAction: null };
		}

		case 'boolean': {
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

			const { nextAction } = await getNextAction({
				flowId: action.flowId,
				currentNodeId: action.id,
				booleanCondition,
				// dbPool,
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

			const shouldClosePool = true;
			if (shouldClosePool) {
				await cleanUpDbPool();
			}

			await wait.for(
				units === 'minutes' ? { minutes: waitFor }
				: units === 'hours' ? { hours: waitFor }
				: units === 'days' ? { days: waitFor }
				: { weeks: waitFor },
			);

			await getDbPool()
				.update(FlowRunActions)
				.set({ status: 'completed' })
				.where(eq(FlowRunActions.id, flowRunActionId));

			const { nextAction } = await getNextAction({
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

			const emailTemplate = await getDbPool().query.EmailTemplates.findFirst({
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
			const { nextAction } = await handleSendEmailFromTemplateToFan({
				action,
				emailTemplate,
				fan,
				flowRunActionId,
				workspaceId,
				flowId: action.flowId,
				currentNodeId: action.id,
			});

			return { nextAction };
		}

		case 'sendEmailFromTemplateGroup': {
			if (!action.emailTemplateGroupId) {
				logger.error(`no email template group id provided for action ${action.id}`);
				return { nextAction: null };
			}

			if (!fan) {
				logger.error(`no fan found with id ${fanId}`);
				return { nextAction: null };
			}

			const emailTemplateGroup = await getDbPool().query.EmailTemplateGroups.findFirst({
				where: eq(EmailTemplateGroups.id, action.emailTemplateGroupId),
				with: {
					_templates_To_Groups: {
						with: {
							emailTemplate: {
								with: {
									from: {
										with: {
											domain: true,
										},
									},
								},
							},
						},
						orderBy: asc(_EmailTemplates_To_EmailTemplateGroups.index),
					},
				},
			});

			if (!emailTemplateGroup) {
				logger.error(
					`no email template group found with id ${action.emailTemplateGroupId}`,
				);
				return { nextAction: null };
			}

			const emailTemplates = emailTemplateGroup._templates_To_Groups.map(
				ets => ets.emailTemplate,
			);

			// check if fan has received any of these email templates
			const emailDeliveries = await getDbPool().query.EmailDeliveries.findMany({
				where: and(
					eq(EmailDeliveries.fanId, fan.id),
					inArray(
						EmailDeliveries.emailTemplateId,
						emailTemplates.map(et => et.id),
					),
				),
				with: {
					emailTemplate: {
						columns: {
							id: true,
						},
					},
				},
			});

			const unsentEmailTemplates = emailTemplates.filter(
				et => !emailDeliveries.some(ed => ed.emailTemplate.id === et.id),
			);

			const emailTemplate = unsentEmailTemplates[0];

			if (!emailTemplate) {
				logger.info(
					`all email templates in group ${action.emailTemplateGroupId} have been sent to fan ${fanId}`,
				);

				const { nextAction } = await getNextAction({
					flowId: action.flowId,
					currentNodeId: action.id,
				});

				return { nextAction };
			}

			const { nextAction } = await handleSendEmailFromTemplateToFan({
				action,
				emailTemplate,
				fan,
				flowRunActionId,
				workspaceId,
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

				const { nextAction } = await getNextAction({
					flowId: action.flowId,
					currentNodeId: action.id,
				});

				return { nextAction };
			}

			const mailchimpAudienceId =
				action.mailchimpAudienceId ??
				raise(`no mailchimp audience id provided for action ${action.id}`);

			const mailchimpAccount =
				(await getDbPool().query.ProviderAccounts.findFirst({
					where: and(
						eq(ProviderAccounts.provider, 'mailchimp'),
						eq(ProviderAccounts.workspaceId, workspaceId),
					),
				})) ?? raise(`no mailchimp account found for workspace ${workspaceId}`);

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

				await getDbPool()
					.update(FlowRunActions)
					.set({ status: 'completed', completedAt: new Date() })
					.where(eq(FlowRunActions.id, flowRunActionId));

				const { nextAction } = await getNextAction({
					flowId: action.flowId,
					currentNodeId: action.id,
				});

				return { nextAction };
			} catch (error) {
				console.log(error);
				logger.error(
					`error adding fan ${fanId} to mailchimp audience ${mailchimpAudienceId}`,
				);
				await getDbPool()
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

			const orders = await getDbPool().query.Carts.findMany({
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

			const orders = await getDbPool().query.Carts.findMany({
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

			const result = await getDbPool()
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

async function handleSendEmailFromTemplateToFan({
	workspaceId,
	action,
	flowRunActionId,

	emailTemplate,
	fan,
}: {
	action: FlowAction;
	emailTemplate: EmailTemplateWithFrom;
	fan: Fan;
	flowRunActionId: string;
	workspaceId: string;
	flowId: string;
	currentNodeId: string;
}): Promise<{ nextAction: FlowAction | null; emailSent: boolean }> {
	if (emailTemplate.type === 'marketing' && !fan.emailMarketingOptIn) {
		logger.info(`fan ${fan.id} has opted out of email marketing`);

		const { nextAction } = await getNextAction({
			flowId: action.flowId,
			currentNodeId: action.id,
		});

		await getDbPool()
			.update(FlowRunActions)
			.set({
				status: 'skipped',
				skippedReason: 'fan has opted out of email marketing',
			})
			.where(eq(FlowRunActions.id, flowRunActionId));

		return { nextAction, emailSent: false };
	}

	const { firstName, lastName } = parseFullName(fan.fullName);

	const { cartFunnels, landingPages, links, pressKits } = await getAssetsFromMdx(
		emailTemplate.body,
	);

	const emailDeliveryId = newId('emailDelivery');

	const listUnsubscribeUrl = getAbsoluteUrl(
		'manageEmail',
		`unsubscribe/${emailDeliveryId}`,
	);

	const { subject, reactBody } = await renderMarkdownToReactEmail({
		subject: emailTemplate.subject,
		body: emailTemplate.body,
		variables: {
			firstName,
			lastName,
		},

		tracking: {
			emailTemplateId: emailTemplate.id,
			fanId: fan.id,
			flowActionId: action.id,
		},

		assets: {
			cartFunnels,
			landingPages,
			links,
			pressKits,
		},

		listUnsubscribeUrl:
			emailTemplate.type === 'marketing' ? listUnsubscribeUrl : undefined,
	});

	const res = await sendEmail({
		to: fan.email,
		bcc: 'adam+flow-monitoring@barely.io',
		from: getEmailAddressFromEmailAddress(emailTemplate.from),
		fromFriendlyName: emailTemplate.from.defaultFriendlyName ?? undefined,
		replyTo: emailTemplate.from.replyTo ?? undefined,
		subject,
		react: reactBody,
		...(emailTemplate.type === 'transactional' ?
			{ type: 'transactional' }
		:	{
				type: 'marketing',
				listUnsubscribeUrl,
			}),
	});

	if (res.error) {
		const error = typeof res.error === 'string' ? res.error : res.error.message;
		logger.error(`error sending email for action ${action.id}: ${error}`);

		await getDbPool()
			.update(FlowRunActions)
			.set({ status: 'failed', error })
			.where(eq(FlowRunActions.id, flowRunActionId));

		await getDbPool().insert(EmailDeliveries).values({
			id: emailDeliveryId,
			workspaceId: workspaceId,
			emailTemplateId: emailTemplate.id,
			fanId: fan.id,
			status: 'failed',
			sentAt: new Date(),
			flowRunActionId,
		});
	} else {
		await getDbPool()
			.update(FlowRunActions)
			.set({ status: 'completed' })
			.where(eq(FlowRunActions.id, flowRunActionId));

		await getDbPool().insert(EmailDeliveries).values({
			id: emailDeliveryId,
			workspaceId: workspaceId,
			emailTemplateId: emailTemplate.id,
			fanId: fan.id,
			status: 'sent',
			sentAt: new Date(),
			flowRunActionId,
		});

		await getDbPool()
			.update(Workspaces)
			.set({ emailUsage: sqlIncrement(Workspaces.emailUsage) })
			.where(eq(Workspaces.id, workspaceId));
	}

	const { nextAction } = await getNextAction({
		flowId: action.flowId,
		currentNodeId: action.id,
	});

	return { nextAction, emailSent: true };
}
