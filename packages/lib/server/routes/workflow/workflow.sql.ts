import { relations } from 'drizzle-orm';
import { boolean, pgTable, text, varchar } from 'drizzle-orm/pg-core';

import { dbId, primaryId, timestamps } from '../../../utils/sql';
import { CartFunnels } from '../cart-funnel/cart-funnel.sql';
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
	action: varchar('action', { enum: WORKFLOW_ACTIONS }),

	// potential actions:
	mailchimpAudienceId: varchar('mailchimpAudienceId'),
});

export const WorkflowActionRelations = relations(WorkflowActions, ({ one }) => ({
	workflow: one(Workflows, {
		fields: [WorkflowActions.workflowId],
		references: [Workflows.id],
	}),
}));
