import type { UseToastOutput } from '@barely/toast';
import type { z } from 'zod';

import type { EmailTemplate } from '../email-template/email-template.schema';
import type {
	FlowAction,
	flowForm_sendEmailSchema,
	InsertFlowAction,
	InsertFlowAction_NotStrict,
	InsertFlowTrigger,
} from './flow.schema';
import type {
	ActionNode,
	AddToMailchimpAudienceNode,
	BooleanNode,
	EmptyNode,
	SendEmailNode,
	TriggerNode,
	WaitNode,
} from './flow.ui.types';
import { newId } from '../../../utils/id';
import { raise } from '../../../utils/raise';

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
				deletable: false,
			} satisfies WaitNode;
		case 'boolean':
			return {
				id: node.id,
				type: 'boolean',
				data: {
					...node,
					booleanCondition: node.booleanCondition ?? 'hasOrderedProduct',
					enabled: node.enabled ?? true,
				},
				position: position ?? { x: 400, y: 25 },
				deletable: false,
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
				},
				position: position ?? { x: 400, y: 25 },
			} satisfies SendEmailNode;
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

/* get flow elements from nodes */

export function getFlowTriggerFromTriggerNode(
	node: TriggerNode,
	flowId: string,
): InsertFlowTrigger {
	return {
		id: node.id,
		flowId,
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
				enabled: node.data.enabled ?? true,
				type: 'sendEmail',
				emailTemplateId: node.data.id,
				emailTemplate: {
					...node.data,
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
			};
		default:
			throw new Error(`Unsupported node type`);
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
					emailTemplate,
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
			default:
				throw new Error(`Unsupported action type: ${fa.type}`);
		}
	});

	return strictFlowActions;
}

/* default flow triggers */

export function getDefaultFlowTrigger({ flowId }: { flowId: string }): InsertFlowTrigger {
	return {
		id: newId('flowTrigger'),
		flowId,
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
		waitFor: 5,
		waitForUnits: 'minutes',
	} satisfies InsertFlowAction_NotStrict;

	const flowActionNode = getActionNodeFromFlowAction(flowAction, props.position);

	// const { id, ...data } = flowAction;

	// const flowActionNode: WaitNode = {
	// 	id,
	// 	type: 'wait',
	// 	data,
	// 	position: props.position ?? { x: 0, y: 0 },
	// } satisfies WaitNode;

	return { flowAction, flowActionNode };
}

export function getDefaultFlowAction_sendEmail(props: {
	flowId: string;
	id?: string;
	emailFromId: string;
	position?: { x: number; y: number };
}) {
	const flowAction = {
		id: props.id ?? newId('flowAction'),
		flowId: props.flowId,
		type: 'sendEmail',
		emailTemplateId: newId('emailTemplate'),
	} satisfies InsertFlowAction_NotStrict;

	const flowActionNode = getActionNodeFromFlowAction(
		{
			...flowAction,
			emailTemplate: {
				id: flowAction.emailTemplateId,
				fromId: props.emailFromId,
				subject: '',
				body: '',
			},
		},
		props.position,
	);

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
	emailFromId?: string;
	mailchimpAudienceId?: string;
	type: 'empty' | 'boolean' | 'wait' | 'sendEmail' | 'addToMailchimpAudience';
	toast?: UseToastOutput['toast'];
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
			if (!props.emailFromId) {
				props.toast?.error('No email from id found');
			}

			return getDefaultFlowAction_sendEmail({
				...props,
				emailFromId: props.emailFromId ?? raise('No email from id found'),
			});
		}
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
