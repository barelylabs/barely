import type { UseToastOutput } from '@barely/toast';
import type {
	EmailTemplate,
	FlowAction,
	flowForm_sendEmailSchema,
	InsertFlowAction,
	InsertFlowAction_NotStrict,
	InsertFlowAction_SendEmail,
	InsertFlowTrigger,
} from '@barely/validators/schemas';
import type { z } from 'zod/v4';
import { newId, raise } from '@barely/utils';

import type {
	ActionNode,
	AddToMailchimpAudienceNode,
	BooleanNode,
	EmptyNode,
	SendEmailFromTemplateGroupNode,
	SendEmailNode,
	TriggerNode,
	WaitNode,
} from './flow.ui.types';

/* get nodes from flow elements */
export function getTriggerNodeFromFlowTrigger(
	node: InsertFlowTrigger,
	position?: { x: number; y: number },
): TriggerNode {
	return {
		id: node.id,
		type: 'trigger',
		data: node,
		position: position ?? { x: 400, y: 25 },
		deletable: false,
	} satisfies TriggerNode;
}

export function getActionNodeFromFlowAction(
	node: InsertFlowAction_NotStrict & {
		emailTemplate?: Omit<z.infer<typeof flowForm_sendEmailSchema>, 'enabled'> | null;
	},
	position?: { x: number; y: number },
): ActionNode {
	switch (node.type) {
		case 'wait':
			return {
				id: node.id,
				type: 'wait',
				data: {
					...node,
					waitFor: node.waitFor ?? 5,
					waitForUnits: node.waitForUnits ?? 'minutes',
					enabled: node.enabled ?? true,
				},
				position: position ?? { x: 400, y: 25 },
				// deletable: false,
			} satisfies WaitNode;
		case 'boolean':
			return {
				id: node.id,
				type: 'boolean',
				data: {
					...node,
					booleanCondition: node.booleanCondition ?? 'hasOrderedCart',
					enabled: node.enabled ?? true,
				},
				position: position ?? { x: 400, y: 25 },
				// deletable: false,
			} satisfies BooleanNode;
		case 'sendEmail': {
			const emailTemplate =
				node.emailTemplate ??
				raise(`getActionNodeFromFlowAction // No email found for action ${node.id}`);
			return {
				...node,
				type: 'sendEmail',
				data: {
					...emailTemplate,
					enabled: node.enabled ?? true,
					name: emailTemplate.name ?? '',
				},
				position: position ?? { x: 400, y: 25 },
			} satisfies SendEmailNode;
		}

		case 'sendEmailFromTemplateGroup': {
			const emailTemplateGroupId =
				node.emailTemplateGroupId ??
				raise(`No email template group id found for action ${node.id}`);
			return {
				id: node.id,
				type: 'sendEmailFromTemplateGroup',
				data: {
					...node,
					emailTemplateGroupId,
					enabled: node.enabled ?? true,
				},
				position: position ?? { x: 400, y: 25 },
			} satisfies SendEmailFromTemplateGroupNode;
		}

		case 'addToMailchimpAudience': {
			const mailchimpAudienceId =
				node.mailchimpAudienceId ??
				raise(`No mailchimp audience id found for action ${node.id}`);
			return {
				id: node.id,
				type: 'addToMailchimpAudience',
				data: {
					...node,
					mailchimpAudienceId,
					enabled: node.enabled ?? true,
				},
				position: position ?? { x: 400, y: 25 },
			} satisfies AddToMailchimpAudienceNode;
		}
		case 'empty':
			return {
				id: node.id,
				type: 'empty',
				data: node,
				position: position ?? { x: 400, y: 25 },
				deletable: false,
			} satisfies EmptyNode;
	}
}

export function hasEdgeLoop(edges: { source: string; target: string }[]): boolean {
	console.log('edges', edges);
	const graph: Record<string, string[]> = {};
	const visited: Record<string, boolean> = {};
	const recursionStack: Record<string, boolean> = {};

	// Build the graph
	for (const edge of edges) {
		(graph[edge.source] ??= []).push(edge.target);
	}

	// DFS function to detect cycle
	function dfs(node: string): boolean {
		if (!visited[node]) {
			visited[node] = true;
			recursionStack[node] = true;

			for (const neighbor of graph[node] ?? []) {
				if (!visited[neighbor] && dfs(neighbor)) {
					return true;
				} else if (recursionStack[neighbor]) {
					return true;
				}
			}
		}

		recursionStack[node] = false;
		return false;
	}

	// Check for cycles starting from each node
	for (const node in graph) {
		if (dfs(node)) return true;
	}

	return false;
}

/* get flow elements from nodes */
export function getFlowTriggerFromTriggerNode(
	node: TriggerNode,
	flowId: string,
): InsertFlowTrigger {
	return {
		id: node.id,
		flowId,
		workspaceId: '',
		...node.data,
	};
}

export function getFlowActionFromActionNode(
	node: ActionNode,
	flowId: string,
): InsertFlowAction {
	switch (node.type) {
		case 'sendEmail':
			return {
				id: node.id,
				flowId,
				enabled: node.data.enabled,
				type: 'sendEmail',
				emailTemplateId: node.data.id,
				emailTemplate: {
					id: node.data.id,
					fromId: node.data.fromId,
					name: node.data.name,
					description: node.data.description,
					type: node.data.type,
					flowOnly: node.data.flowOnly,
					broadcastOnly: node.data.broadcastOnly,
					replyTo: node.data.replyTo,
					subject: node.data.subject,
					previewText: node.data.previewText ?? '',
					body: node.data.body,
					deliveries: node.data.deliveries,
					opens: node.data.opens,
					clicks: node.data.clicks,
					value: node.data.value,
				},
			};
		case 'wait':
			return {
				id: node.id,
				flowId,
				type: 'wait',
				...node.data,
			};
		case 'empty':
			return {
				id: node.id,
				flowId,
				type: 'empty',
				...node.data,
			};
		case 'boolean':
			return {
				id: node.id,
				flowId,
				type: 'boolean',
				...node.data,
				booleanCondition: node.data.booleanCondition ?? 'hasOrderedCart',
			};
		case 'sendEmailFromTemplateGroup':
			return {
				id: node.id,
				flowId,
				type: 'sendEmailFromTemplateGroup',
				...node.data,
			};
		case 'addToMailchimpAudience':
			return {
				id: node.id,
				flowId,
				type: 'addToMailchimpAudience',
				...node.data,
				mailchimpAudienceId: node.data.mailchimpAudienceId ?? null,
			};
	}
}

export function getInsertableFlowActionsFromFlowActions(
	flowActions: (FlowAction & { emailTemplate?: EmailTemplate | null })[],
): InsertFlowAction[] {
	const strictFlowActions: InsertFlowAction[] = flowActions.map(fa => {
		switch (fa.type) {
			case 'sendEmail': {
				const emailTemplate =
					fa.emailTemplate ??
					raise(
						`getInsertableFlowActionsFromFlowActions // No email template found for action ${fa.id}`,
					);

				return {
					...fa,
					type: 'sendEmail',
					emailTemplate: {
						...emailTemplate,
						replyTo: emailTemplate.replyTo ?? undefined,
						previewText: emailTemplate.previewText ?? undefined,
					},
				} satisfies InsertFlowAction;
			}
			case 'wait':
				return {
					...fa,
					type: 'wait',
				} satisfies InsertFlowAction;
			case 'empty':
				return {
					...fa,
					type: 'empty',
				} satisfies InsertFlowAction;
			case 'boolean':
				return {
					...fa,
					type: 'boolean',
				} satisfies InsertFlowAction;
			case 'sendEmailFromTemplateGroup':
				return {
					...fa,
					type: 'sendEmailFromTemplateGroup',
				} satisfies InsertFlowAction;
			case 'addToMailchimpAudience':
				return {
					...fa,
					type: 'addToMailchimpAudience',
				} satisfies InsertFlowAction;
		}
	});

	return strictFlowActions;
}

/* default flow triggers */
export function getDefaultFlowTrigger({
	flowId,
	workspaceId,
}: {
	flowId: string;
	workspaceId: string;
}): InsertFlowTrigger {
	return {
		id: newId('flowTrigger'),
		flowId,
		workspaceId,
		type: 'callFlow',
	};
}

/* default flow actions */
export function getDefaultFlowAction_empty(props: {
	flowId: string;
	position?: { x: number; y: number };
}) {
	const flowAction = {
		id: newId('flowAction'),
		flowId: props.flowId,
		type: 'empty',
	} satisfies InsertFlowAction_NotStrict;

	const flowActionNode = getActionNodeFromFlowAction(flowAction, props.position);

	return { flowAction, flowActionNode };
}

export function getDefaultFlowAction_boolean(props: {
	flowId: string;
	id?: string;
	position?: { x: number; y: number };
}) {
	const flowAction = {
		id: props.id ?? newId('flowAction'),
		flowId: props.flowId,
		type: 'boolean',
		booleanCondition: 'hasOrderedCart',
	} satisfies InsertFlowAction_NotStrict;

	const flowActionNode = getActionNodeFromFlowAction(flowAction, props.position);

	// const flowActionNode: BooleanNode = {
	// 	id,
	// 	type: 'boolean',
	// 	data,
	// 	position: props.position ?? { x: 0, y: 0 },
	// } satisfies BooleanNode;

	return { flowAction, flowActionNode };
}

export function getDefaultFlowAction_wait(props: {
	flowId: string;
	id?: string;
	position?: { x: number; y: number };
}) {
	const flowAction = {
		id: props.id ?? newId('flowAction'),
		flowId: props.flowId,
		type: 'wait',
		waitFor: 1,
		waitForUnits: 'days',
	} satisfies InsertFlowAction_NotStrict;

	const flowActionNode = getActionNodeFromFlowAction(flowAction, props.position);

	return { flowAction, flowActionNode };
}

export function getDefaultFlowAction_sendEmail(props: {
	flowId: string;
	id?: string;
	position?: { x: number; y: number };

	emailTemplate: Partial<EmailTemplate> & { fromId: EmailTemplate['fromId'] };
}) {
	const emailTemplate = props.emailTemplate;

	const emailTemplateId = newId('emailTemplate');

	const flowAction = {
		id: props.id ?? newId('flowAction'),
		flowId: props.flowId,
		type: 'sendEmail',
		enabled: true,
		emailTemplateId,
	} satisfies Omit<InsertFlowAction_SendEmail, 'emailTemplate'>;

	const flowActionNode = getActionNodeFromFlowAction(
		{
			...flowAction,
			emailTemplate: {
				...emailTemplate,
				id: flowAction.emailTemplateId,
				fromId: emailTemplate.fromId,
				subject: emailTemplate.subject ?? '',
				body: emailTemplate.body ?? '',
				type: emailTemplate.type ?? 'marketing',
				replyTo: emailTemplate.replyTo ?? undefined,
				previewText: emailTemplate.previewText ?? undefined,
			},
		},
		props.position,
	);

	return { flowAction, flowActionNode };
}

export function getDefaultFlowAction_sendEmailTemplateGroup(props: {
	flowId: string;
	emailTemplateGroupId: string;
	id?: string;
	position?: { x: number; y: number };
}) {
	const flowAction = {
		id: props.id ?? newId('flowAction'),
		flowId: props.flowId,
		type: 'sendEmailFromTemplateGroup',
		emailTemplateGroupId: props.emailTemplateGroupId,
	} satisfies InsertFlowAction_NotStrict;

	const flowActionNode = getActionNodeFromFlowAction(flowAction, props.position);

	return { flowAction, flowActionNode };
}

export function getDefaultFlowAction_addToMailchimpAudience(props: {
	flowId: string;
	mailchimpAudienceId: string;
	id?: string;
	position?: { x: number; y: number };
}) {
	const flowAction = {
		id: props.id ?? newId('flowAction'),
		flowId: props.flowId,
		type: 'addToMailchimpAudience',
		mailchimpAudienceId: props.mailchimpAudienceId,
	} satisfies InsertFlowAction_NotStrict;

	const flowActionNode = getActionNodeFromFlowAction(flowAction, props.position);

	return { flowAction, flowActionNode };
}

interface DefaultFlowActionProps {
	flowId: string;
	id?: string;
	position?: { x: number; y: number };
	type: FlowAction['type'];
	toast?: UseToastOutput['toast'];

	emailTemplate?: Partial<EmailTemplate> & { fromId: EmailTemplate['fromId'] };
	// emailFromId?: string;
	emailTemplateGroupId?: string;
	mailchimpAudienceId?: string;
}

export function getDefaultFlowAction(props: DefaultFlowActionProps) {
	switch (props.type) {
		case 'empty':
			return getDefaultFlowAction_empty(props);
		case 'boolean':
			return getDefaultFlowAction_boolean(props);
		case 'wait':
			return getDefaultFlowAction_wait(props);
		case 'sendEmail': {
			if (!props.emailTemplate?.fromId) {
				props.toast?.error('No email from id found');
			}

			return getDefaultFlowAction_sendEmail({
				...props,
				emailTemplate: {
					...props.emailTemplate,
					fromId: props.emailTemplate?.fromId ?? raise('No email from id found'),
					flowOnly: props.emailTemplate?.flowOnly ?? true,
				},
			});
		}
		case 'sendEmailFromTemplateGroup':
			if (!props.emailTemplateGroupId) {
				props.toast?.error('No email template group id found');
			}

			return getDefaultFlowAction_sendEmailTemplateGroup({
				...props,
				emailTemplateGroupId:
					props.emailTemplateGroupId ?? raise('No email template group id found'),
			});
		case 'addToMailchimpAudience':
			if (!props.mailchimpAudienceId) {
				props.toast?.error('No mailchimp audience id found');
			}

			return getDefaultFlowAction_addToMailchimpAudience({
				...props,
				mailchimpAudienceId:
					props.mailchimpAudienceId ?? raise('No mailchimp audience id found'),
			});
	}
}
