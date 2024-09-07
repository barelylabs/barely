import { tasks } from '@trigger.dev/sdk/v3';
import { and, eq } from 'drizzle-orm';

import type { handleFlow } from '../../../trigger/flow.trigger';
import { newId } from '../../../utils/id';
import { raise } from '../../../utils/raise';
import { dbHttp } from '../../db';
import { Flow_Triggers } from '../flow/flow.sql';
// import { handleFlow } from '../flow/trigger/flow.trigger';
import { Fans } from './fan.sql';

export async function createFan(props: {
	workspaceId: string;
	fullName: string;
	email: string;
	shippingAddressLine1?: string | null;
	shippingAddressLine2?: string | null;
	shippingAddressCity?: string | null;
	shippingAddressState?: string | null;
	shippingAddressPostalCode?: string | null;
	shippingAddressCountry?: string | null;

	billingAddressPostalCode?: string | null;
	billingAddressCountry?: string | null;

	stripeCustomerId?: string | null;
	stripePaymentMethodId?: string | null;

	emailMarketingOptIn?: boolean;
	smsMarketingOptIn?: boolean;
}) {
	const newFans = await dbHttp
		.insert(Fans)
		.values({
			id: newId('fan'),
			...props,
		})
		.returning();

	const newFan = newFans[0] ?? raise('error creating new fan');

	const newFanFlowTriggers = await dbHttp
		.select()
		.from(Flow_Triggers)
		// .leftJoin(
		// 	Flows,
		// 	and(
		// 		eq(Flows.id, Flow_Triggers.flowId),
		// 		isNull(Flows.deletedAt),
		// 		isNull(Flows.archivedAt),
		// 	),
		// )
		.where(
			and(
				eq(Flow_Triggers.type, 'newFan'),
				eq(Flow_Triggers.workspaceId, props.workspaceId),
			),
		)
		.execute();

	if (newFanFlowTriggers.length) {
		for (const newFanFlowTrigger of newFanFlowTriggers) {
			await tasks.trigger<typeof handleFlow>('handle-flow', {
				triggerId: newFanFlowTrigger.id,
				fanId: newFan.id,
			});
		}
	}

	// const newFanTriggers = await dbHttp
	// 	.select()
	// 	.from(WorkflowTriggers)
	// 	.leftJoin(
	// 		Workflows,
	// 		and(
	// 			eq(Workflows.id, WorkflowTriggers.workflowId),
	// 			isNull(Workflows.deletedAt),
	// 			eq(Workflows.archived, false),
	// 		),
	// 	)
	// 	.where(
	// 		and(
	// 			eq(WorkflowTriggers.trigger, 'NEW_FAN'),
	// 			eq(Workflows.workspaceId, props.workspaceId),
	// 		),
	// 	)
	// 	.execute();

	// if (newFanTriggers.length) {
	// 	// create workflowRuns
	// 	for (const newFanWorkflows of newFanTriggers) {
	// 		const workflow =
	// 			newFanWorkflows.Workflows ?? raise('no workflow found for new fan trigger');
	// 		const trigger =
	// 			newFanWorkflows.WorkflowTriggers ?? raise('no trigger found for new fan trigger');
	// 		const firstAction =
	// 			(await dbHttp.query.WorkflowActions.findFirst({
	// 				where: eq(WorkflowActions.workflowId, workflow.id),
	// 				orderBy: asc(WorkflowActions.lexorank),
	// 			})) ?? raise('no first action found for workflow');

	// 		await dbHttp.insert(WorkflowRuns).values({
	// 			id: newId('workflowRun'),
	// 			workflowId: workflow.id,
	// 			triggerId: trigger.id,
	// 			triggerFanId: newFan.id,
	// 			status: 'pending',
	// 			currentActionId: firstAction.id,
	// 			runCurrentActionAt:
	// 				firstAction.waitFor ? new Date(Date.now() + firstAction.waitFor) : new Date(),
	// 		});

	// 		void fetch(getAbsoluteUrl('app', 'api/workflows/run'), {
	// 			method: 'POST',
	// 		});
	// 	}
	// }

	return newFan;
}
