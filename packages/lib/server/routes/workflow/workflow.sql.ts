import { relations } from 'drizzle-orm';
import { boolean, integer, pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core';

import { dbId, primaryId, timestamps } from '../../../utils/sql';
import { CartFunnels } from '../cart-funnel/cart-funnel.sql';
import { Fans } from '../fan/fan.sql';
import { Workspaces } from '../workspace/workspace.sql';
import { WORKFLOW_ACTIONS, WORKFLOW_TRIGGERS } from './workflow.constants';

/** WORKFLOWS */

export const Workflows = pgTable('Workflows', {
	...primaryId,
	...timestamps,

	workspaceId: dbId('workspaceId')
		.notNull()
		.references(() => Workspaces.id, {
			onDelete: 'cascade',
		}),

	name: varchar('name').notNull(),
	description: text('description'),

	archived: boolean('archived').default(false),
});

export const WorkflowRelations = relations(Workflows, ({ one, many }) => ({
	workspace: one(Workspaces, {
		fields: [Workflows.workspaceId],
		references: [Workspaces.id],
	}),

	triggers: many(WorkflowTriggers),
	actions: many(WorkflowActions),
}));

/** WORKFLOW TRIGGERS */

export const WorkflowTriggers = pgTable('WorkflowTriggers', {
	...primaryId,
	workflowId: dbId('workflowId')
		.notNull()
		.references(() => Workflows.id, { onDelete: 'cascade' }),
	trigger: varchar('trigger', { enum: WORKFLOW_TRIGGERS }).notNull(),

	// potential triggers:
	cartFunnelId: dbId('cartFunnelId').references(() => CartFunnels.id),
});

export const WorkflowTriggerRelations = relations(WorkflowTriggers, ({ one }) => ({
	workflow: one(Workflows, {
		fields: [WorkflowTriggers.workflowId],
		references: [Workflows.id],
	}),
	cartFunnel: one(CartFunnels, {
		fields: [WorkflowTriggers.cartFunnelId],
		references: [CartFunnels.id],
	}),
}));

/** WORKFLOW ACTIONS */

export const WorkflowActions = pgTable('WorkflowActions', {
	...primaryId,
	...timestamps,

	workflowId: dbId('workflowId')
		.notNull()
		.references(() => Workflows.id, {
			onDelete: 'cascade',
		}),
	lexorank: text('lexorank'),
	action: varchar('action', { enum: WORKFLOW_ACTIONS }).notNull(),

	// potential actions:
	waitFor: integer('waitFor').default(0), // wait in ms
	mailchimpAudienceId: varchar('mailchimpAudienceId'),
});

export const WorkflowActionRelations = relations(WorkflowActions, ({ one }) => ({
	workflow: one(Workflows, {
		fields: [WorkflowActions.workflowId],
		references: [Workflows.id],
	}),
}));

/** WORKFLOW RUNS */

export const WorkflowRuns = pgTable('WorkflowRuns', {
	...primaryId,
	...timestamps,

	workflowId: dbId('workflowId')
		.notNull()
		.references(() => Workflows.id, {
			onDelete: 'cascade',
		}),

	triggerId: dbId('triggerId')
		.notNull()
		.references(() => WorkflowTriggers.id, {
			onDelete: 'cascade',
		}),
	triggerFanId: dbId('triggerFanId').references(() => Fans.id, {
		onDelete: 'cascade',
	}),

	currentActionId: dbId('currentActionId')
		.notNull()
		.references(() => WorkflowActions.id),

	status: text('status', {
		enum: ['pending', 'in_progress', 'complete', 'failed'],
	}).notNull(),

	runCurrentActionAt: timestamp('runCurrentActionAt').notNull(),

	failedAt: timestamp('failedAt'),
	completedAt: timestamp('completedAt'),
});

export const WorkflowRunRelations = relations(WorkflowRuns, ({ one, many }) => ({
	workflow: one(Workflows, {
		fields: [WorkflowRuns.workflowId],
		references: [Workflows.id],
	}),
	trigger: one(WorkflowTriggers, {
		fields: [WorkflowRuns.triggerId],
		references: [WorkflowTriggers.id],
	}),
	triggerFan: one(Fans, {
		fields: [WorkflowRuns.triggerFanId],
		references: [Fans.id],
	}),
	currentAction: one(WorkflowActions, {
		fields: [WorkflowRuns.currentActionId],
		references: [WorkflowActions.id],
	}),
	actionRuns: many(WorkflowRunActions),
}));

/** WORKFLOW ACTION LOGS */

export const WorkflowRunActions = pgTable('WorkflowRunActions', {
	...primaryId,
	...timestamps,

	workflowRunId: dbId('workflowRunId')
		.notNull()
		.references(() => WorkflowRuns.id, {
			onDelete: 'cascade',
		}),
	workflowActionId: dbId('workflowActionId')
		.notNull()
		.references(() => WorkflowActions.id, {
			onDelete: 'cascade',
		}),

	status: text('status', {
		enum: ['pending', 'skipped', 'in_progress', 'success', 'failed'],
	}).notNull(),

	skippedReason: text('skippedReason'),

	error: varchar('error', { length: 255 }),
	failedAt: timestamp('failedAt'),
	completedAt: timestamp('completedAt'),
});

export const WorkflowRunActionRelations = relations(WorkflowRunActions, ({ one }) => ({
	workflowRun: one(WorkflowRuns, {
		fields: [WorkflowRunActions.workflowRunId],
		references: [WorkflowRuns.id],
	}),
	workflowAction: one(WorkflowActions, {
		fields: [WorkflowRunActions.workflowActionId],
		references: [WorkflowActions.id],
	}),
}));
