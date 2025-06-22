import { and, eq, gt, inArray, lt } from 'drizzle-orm';

import type {
	ActionalableWorkflowRun,
	InsertWorkflowRunAction,
} from './workflow-run.schema';
import { newId } from '../../../utils/id';
import { raise } from '../../../utils/raise';
import { dbHttp } from '../../db';
import { addToMailchimpAudience } from '../../mailchimp/mailchimp.endpts.audiences';
import { Fans } from '../fan/fan.sql';
import { ProviderAccounts } from '../provider-account/provider-account.sql';
import {
	WorkflowActions,
	WorkflowRunActions,
	WorkflowRuns,
} from '../workflow/workflow.sql';

export async function getActionableWorkflowRuns() {
	const now = new Date();
	const limit = 10;

	const workflowRuns = (await dbHttp.query.WorkflowRuns.findMany({
		where: and(
			inArray(WorkflowRuns.status, ['pending', 'in_progress']),
			lt(WorkflowRuns.runCurrentActionAt, now),
		),
		with: {
			workflow: true,
			currentAction: true,
		},
		limit: limit + 1,
	})) satisfies ActionalableWorkflowRun[];

	let moreWorkflowRuns = false;

	if (workflowRuns.length > limit) {
		moreWorkflowRuns = true;
		workflowRuns.pop();
	}

	return {
		workflowRuns,
		moreWorkflowRuns,
	};
}

export async function handleActionableWorkflowRuns() {
	const { workflowRuns, moreWorkflowRuns } = await getActionableWorkflowRuns();

	for (const workflowRun of workflowRuns) {
		await handleWorkflowRunCurrentAction({ workflowRun });
	}

	if (moreWorkflowRuns) {
		await handleActionableWorkflowRuns();
	}
}

export async function handleWorkflowRunCurrentAction({
	workflowRun,
}: {
	workflowRun: ActionalableWorkflowRun;
}) {
	const { currentAction } = workflowRun;

	if (workflowRun.runCurrentActionAt > new Date()) return;

	switch (currentAction.action) {
		case 'WAIT':
			await handleNextActionOrCompleteRun({ workflowRun });
			break;
		case 'ADD_TO_MAILCHIMP_AUDIENCE':
			await handleAction_addToMailchimpAudience({ workflowRun });
			break;
	}
}

export async function handleAction_addToMailchimpAudience({
	workflowRun,
}: {
	workflowRun: ActionalableWorkflowRun;
}) {
	const { workflow, currentAction } = workflowRun;
	const triggerFanId = workflowRun.triggerFanId ?? raise('Trigger fan ID not set');

	const mailchimpAudienceId =
		currentAction.mailchimpAudienceId ?? raise('Mailchimp audience ID not set');

	const fan =
		(await dbHttp.query.Fans.findFirst({
			where: eq(Fans.id, triggerFanId),
		})) ?? raise('Fan not found to add to mailchimp audience');

	const mailchimpAccount =
		(await dbHttp.query.ProviderAccounts.findFirst({
			where: and(
				eq(ProviderAccounts.provider, 'mailchimp'),
				eq(ProviderAccounts.workspaceId, workflow.workspaceId),
			),
		})) ?? raise('Mailchimp account not configured for action');

	const workflowRunAction: InsertWorkflowRunAction = {
		id: newId('workflowRunAction'),
		workflowRunId: workflowRun.id,
		workflowActionId: currentAction.id,
		status: 'success',
	};

	// add to mailchimp audience

	if (!fan.emailMarketingOptIn) {
		workflowRunAction.status = 'skipped';
		workflowRunAction.skippedReason = 'Fan has not opted in to email marketing';
		return;
	} else {
		try {
			await addToMailchimpAudience({
				accessToken:
					mailchimpAccount.access_token ?? raise('Mailchimp access token not set'),
				server: mailchimpAccount.server ?? raise('Mailchimp server not set'),
				listId: mailchimpAudienceId,
				fan,
			});
			workflowRunAction.completedAt = new Date();
		} catch {
			workflowRunAction.status = 'failed';
			workflowRunAction.failedAt = new Date();
			workflowRunAction.error = 'error adding to mailchimp audience';
		}
	}

	// add action record
	await dbHttp.insert(WorkflowRunActions).values(workflowRunAction);

	if (workflowRunAction.status !== 'failed') {
		await handleNextActionOrCompleteRun({ workflowRun });
	}
}

async function handleNextActionOrCompleteRun({
	workflowRun,
}: {
	workflowRun: ActionalableWorkflowRun;
}) {
	const { currentAction } = workflowRun;

	const nextAction = await dbHttp.query.WorkflowActions.findFirst({
		where: and(
			eq(WorkflowActions.workflowId, workflowRun.workflowId),
			gt(
				WorkflowActions.lexorank,
				currentAction.lexorank ?? raise('Current action lexorank not set'),
			),
		),
	});

	if (!nextAction) {
		await dbHttp
			.update(WorkflowRuns)
			.set({
				status: 'complete',
				completedAt: new Date(),
			})
			.where(eq(WorkflowRuns.id, workflowRun.id));
	} else {
		await dbHttp
			.update(WorkflowRuns)
			.set({
				currentActionId: nextAction.id,
				runCurrentActionAt:
					nextAction.waitFor ? new Date(Date.now() + nextAction.waitFor) : new Date(),
			})
			.where(eq(WorkflowRuns.id, workflowRun.id));
		// trigger next action
		await handleWorkflowRunCurrentAction({ workflowRun });
	}
}
