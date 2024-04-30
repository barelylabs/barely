import { and, asc, eq, isNull } from 'drizzle-orm';

import { newId } from '../../../utils/id';
import { raise } from '../../../utils/raise';
import { db } from '../../db';
import {
	WorkflowActions,
	WorkflowRuns,
	Workflows,
	WorkflowTriggers,
} from '../workflow/workflow.sql';
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
}) {
	const newFans = await db.pool
		.insert(Fans)
		.values({
			id: newId('fan'),
			...props,
		})
		.returning();

	const newFan = newFans[0] ?? raise('error creating new fan');

	// if there are any new fan workflows, create workflowRuns here
	// const newFanTriggers = await db.pool.query.WorkflowTriggers.findMany({
	//     where: and(
	//         eq(Workflows.workspaceId, props.workspaceId),
	//     )
	// })

	const newFanTriggers = await db.pool
		.select()
		.from(WorkflowTriggers)
		.leftJoin(
			Workflows,
			and(
				eq(Workflows.id, WorkflowTriggers.workflowId),
				isNull(Workflows.deletedAt),
				eq(Workflows.archived, false),
			),
		)
		.where(
			and(
				eq(WorkflowTriggers.trigger, 'NEW_FAN'),
				eq(Workflows.workspaceId, props.workspaceId),
			),
		)
		.execute();

	if (newFanTriggers.length) {
		// create workflowRuns
		for (const newFanWorkflows of newFanTriggers) {
			const workflow =
				newFanWorkflows.Workflows ?? raise('no workflow found for new fan trigger');
			const trigger =
				newFanWorkflows.WorkflowTriggers ?? raise('no trigger found for new fan trigger');
			const firstAction =
				(await db.pool.query.WorkflowActions.findFirst({
					where: eq(WorkflowActions.workflowId, workflow.id),
					orderBy: asc(WorkflowActions.lexorank),
				})) ?? raise('no first action found for workflow');

			await db.pool.insert(WorkflowRuns).values({
				id: newId('workflowRun'),
				workflowId: workflow.id,
				triggerId: trigger.id,
				triggerFanId: newFan.id,
				status: 'pending',
				currentActionId: firstAction.id,
				runCurrentActionAt:
					firstAction.waitFor ? new Date(Date.now() + firstAction.waitFor) : new Date(),
			});

			void fetch('/api/workflow/run', {
				method: 'POST',
			});
		}
	}

	return newFan;
}
