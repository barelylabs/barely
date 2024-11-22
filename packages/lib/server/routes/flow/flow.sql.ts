/* FLOWS */

import { relations } from 'drizzle-orm';
import {
	boolean,
	foreignKey,
	integer,
	pgTable,
	primaryKey,
	text,
	timestamp,
	varchar,
} from 'drizzle-orm/pg-core';

import type { FlowEdge } from './flow.ui.types';
import { TRIGGER_WAIT_UNITS } from '../../../trigger/trigger.constants';
import { customJsonb, dbId, primaryId, timestamps } from '../../../utils/sql';
import { CartFunnels } from '../cart-funnel/cart-funnel.sql';
import { Carts } from '../cart/cart.sql';
import {
	EmailTemplateGroups,
	EmailTemplates,
} from '../email-template/email-template.sql';
import { Fans } from '../fan/fan.sql';
import { Products } from '../product/product.sql';
import { Workspaces } from '../workspace/workspace.sql';
import {
	FLOW_ACTIONS,
	FLOW_BOOLEAN_CONDITIONS,
	FLOW_RUN_ACTION_STATUSES,
	FLOW_RUN_STATUSES,
	FLOW_TRIGGERS,
} from './flow.constants';

export const Flows = pgTable('Flows', {
	...primaryId,
	...timestamps,

	workspaceId: dbId('workspaceId')
		.notNull()
		.references(() => Workspaces.id),

	name: varchar('name', { length: 256 }).notNull(),
	description: text('description'),

	edges: customJsonb<FlowEdge[]>('edges').notNull().default([]),

	archived: boolean('archived').default(false),
	enabled: boolean('enabled').notNull().default(false),
	paused: boolean('paused').notNull().default(false), // paused is different from enabled. if paused, the flow will trigger but not execute actions
});

export const FlowsRelations = relations(Flows, ({ one, many }) => ({
	workspace: one(Workspaces, {
		fields: [Flows.workspaceId],
		references: [Workspaces.id],
	}),

	triggers: many(Flow_Triggers),
	actions: many(FlowActions),
}));

/* FLOW TRIGGERS */
export const Flow_Triggers = pgTable(
	'Flow_Triggers',
	{
		...timestamps,

		flowId: dbId('flowId')
			.notNull()
			.references(() => Flows.id, { onDelete: 'cascade' }),
		workspaceId: dbId('workspaceId'),
		//fixme: uncomment this once workspaceId is added to existing triggers
		// .notNull()
		// .references(() => Flows.workspaceId),

		id: dbId('id').notNull(),

		type: text('type', { enum: FLOW_TRIGGERS }).notNull(),

		enabled: boolean('enabled').notNull().default(true),
		// potential triggers:
		productId: dbId('productId').references(() => Products.id),
		cartFunnelId: dbId('cartFunnels').references(() => CartFunnels.id),
		totalOrderAmount: integer('totalOrderAmount'), // in cents
	},
	table => ({
		primaryKey: primaryKey({ columns: [table.flowId, table.id] }),
	}),
);

export const FlowTriggerRelations = relations(Flow_Triggers, ({ one }) => ({
	flow: one(Flows, {
		fields: [Flow_Triggers.flowId],
		references: [Flows.id],
	}),
	cartFunnel: one(CartFunnels, {
		fields: [Flow_Triggers.cartFunnelId],
		references: [CartFunnels.id],
	}),
}));

/* FLOW ACTIONS */
export const FlowActions = pgTable(
	'Flow_Actions',
	{
		...timestamps,

		flowId: dbId('flowId')
			.notNull()
			.references(() => Flows.id, { onDelete: 'cascade' }),
		id: dbId('id').notNull(),

		type: text('type', { enum: FLOW_ACTIONS }).notNull(),

		enabled: boolean('enabled').notNull().default(true),

		/* potential actions: */
		// 🕒
		waitFor: integer('waitFor'),
		waitForUnits: text('waitForUnits', { enum: TRIGGER_WAIT_UNITS }),
		// 📧
		emailTemplateId: dbId('emailTemplateId').references(() => EmailTemplates.id),
		emailTemplateGroupId: dbId('emailTemplateGroupId').references(
			() => EmailTemplateGroups.id,
		),

		// 🔄
		booleanCondition: text('booleanCondition', { enum: FLOW_BOOLEAN_CONDITIONS }),
		// external actions:
		productId: dbId('productId').references(() => Products.id),
		cartFunnelId: dbId('cartFunnelId').references(() => CartFunnels.id),
		totalOrderAmount: integer('totalOrderAmount'), // in cents
		mailchimpAudienceId: text('mailchimpAudienceId'),

		// stats
		deliveries: integer('deliveries').default(0),
		opens: integer('opens').default(0),
		clicks: integer('clicks').default(0),
		value: integer('value').default(0),
	},
	table => ({
		primaryKey: primaryKey({ columns: [table.flowId, table.id] }),
	}),
);

export const FlowActionRelations = relations(FlowActions, ({ one }) => ({
	flow: one(Flows, {
		fields: [FlowActions.flowId],
		references: [Flows.id],
	}),
	emailTemplate: one(EmailTemplates, {
		fields: [FlowActions.emailTemplateId],
		references: [EmailTemplates.id],
	}),
}));

/** FLOW RUNS */
export const Flow_Runs = pgTable(
	'Flow_Runs',
	{
		...primaryId,
		...timestamps,

		flowId: dbId('flowId')
			.notNull()
			.references(() => Flows.id, {
				onDelete: 'cascade',
			}),
		triggerId: dbId('triggerId').notNull(),
		triggerFanId: dbId('triggerFanId').references(() => Fans.id),
		triggerCartId: dbId('triggerCartId').references(() => Carts.id),

		currentActionNodeId: text('currentActionNodeId'),

		status: text('status', { enum: FLOW_RUN_STATUSES }).notNull(),

		failedAt: timestamp('failedAt'),
		completedAt: timestamp('completedAt'),
	},
	t => ({
		actionFk: foreignKey({
			columns: [t.flowId, t.currentActionNodeId],
			foreignColumns: [FlowActions.flowId, FlowActions.id],
		}),
		triggerFk: foreignKey({
			columns: [t.flowId, t.triggerId],
			foreignColumns: [Flow_Triggers.flowId, Flow_Triggers.id],
		}),
	}),
);

export const FlowRunRelations = relations(Flow_Runs, ({ one, many }) => ({
	flow: one(Flows, {
		fields: [Flow_Runs.flowId],
		references: [Flows.id],
	}),
	trigger: one(Flow_Triggers, {
		fields: [Flow_Runs.flowId, Flow_Runs.triggerId],
		references: [Flow_Triggers.flowId, Flow_Triggers.id],
	}),
	triggerFan: one(Fans, {
		fields: [Flow_Runs.triggerFanId],
		references: [Fans.id],
	}),
	currentAction: one(FlowActions, {
		fields: [Flow_Runs.flowId, Flow_Runs.currentActionNodeId],
		references: [FlowActions.flowId, FlowActions.id],
	}),
	actions: many(FlowRunActions),
}));

/** FLOW ACTION LOGS */
export const FlowRunActions = pgTable(
	'Flow_Run_Actions',
	{
		...primaryId,
		...timestamps,

		flowRunId: dbId('workflowRunId')
			.notNull()
			.references(() => Flow_Runs.id, {
				onDelete: 'cascade',
			}),

		flowId: dbId('flowId')
			.notNull()
			.references(() => Flows.id, {
				onDelete: 'cascade',
			}),
		flowActionId: dbId('flowActionId').notNull(),

		status: text('status', { enum: FLOW_RUN_ACTION_STATUSES }).notNull(),

		skippedReason: text('skippedReason'),

		error: text('error'),
		failedAt: timestamp('failedAt'),
		completedAt: timestamp('completedAt'),
	},
	t => ({
		flowActionFk: foreignKey({
			columns: [t.flowId, t.flowActionId],
			foreignColumns: [FlowActions.flowId, FlowActions.id],
		}),
	}),
);

export const FlowRunActionRelations = relations(FlowRunActions, ({ one }) => ({
	flowRun: one(Flow_Runs, {
		fields: [FlowRunActions.flowRunId],
		references: [Flow_Runs.id],
	}),
	flowAction: one(FlowActions, {
		fields: [FlowRunActions.flowId, FlowRunActions.flowActionId],
		references: [FlowActions.flowId, FlowActions.id],
	}),
}));
