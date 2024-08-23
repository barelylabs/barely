import type { InferSelectModel } from 'drizzle-orm';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

import { TRIGGER_WAIT_UNITS } from '../../../trigger/trigger.constants';
import { updateEmailSchema } from '../email/email.schema';
import { FLOW_BOOLEAN_CONDITIONS, FLOW_TRIGGERS } from './flow.constants';
import { Flow_Actions, Flow_Triggers, Flows } from './flow.sql';

export const insertFlowSchema = createInsertSchema(Flows);
export const createFlowSchema = insertFlowSchema
	.omit({
		id: true,
	})
	.partial({
		workspaceId: true,
	});
export const upsertFlowSchema = insertFlowSchema.partial({
	id: true,
	workspaceId: true,
});

export type InsertFlow = z.infer<typeof insertFlowSchema>;
export type CreateFlow = z.infer<typeof createFlowSchema>;
export type UpsertFlow = z.infer<typeof upsertFlowSchema>;
export type Flow = InferSelectModel<typeof Flows>;

// Flow Action
export const insertFlowActionSchema = createInsertSchema(Flow_Actions);
export const createFlowActionSchema = insertFlowActionSchema
	.omit({
		id: true,
	})
	.partial({
		flowId: true,
	});
export const upsertFlowActionSchema = insertFlowActionSchema.partial({
	id: true,
	flowId: true,
});

export const updateFlowAction_sendEmailSchema = insertFlowActionSchema
	.partial()
	.required({
		id: true,
	})
	.merge(
		z.object({
			email: updateEmailSchema,
		}),
	);
export const updateFlowAction_waitSchema = insertFlowActionSchema
	.partial()
	.required({
		id: true,
	})
	.merge(
		z.object({
			data: z.object({
				duration: z.coerce.number(),
				units: z.enum(TRIGGER_WAIT_UNITS),
			}),
		}),
	);

export const updateFlowAction_booleanSchema = insertFlowActionSchema
	.partial()
	.required({
		id: true,
	})
	.merge(
		z.object({
			data: z.object({
				condition: z.enum(FLOW_BOOLEAN_CONDITIONS),
			}),
		}),
	);

export type InsertFlowAction = z.infer<typeof insertFlowActionSchema>;
export type CreateFlowAction = z.infer<typeof createFlowActionSchema>;
export type UpsertFlowAction = z.infer<typeof upsertFlowActionSchema>;
export type FlowAction = InferSelectModel<typeof Flow_Actions>;

// Flow Trigger
export const insertFlowTriggerSchema = createInsertSchema(Flow_Triggers);
export const createFlowTriggerSchema = insertFlowTriggerSchema
	.omit({
		id: true,
	})
	.partial({
		flowId: true,
	});

export const upsertFlowTriggerSchema = insertFlowTriggerSchema.partial({
	id: true,
	flowId: true,
});

export const updateFlowTriggerSchema = insertFlowTriggerSchema
	.partial()
	.required({
		id: true,
	})
	.merge(
		z.object({
			data: z.object({
				trigger: z.enum(FLOW_TRIGGERS),
				cartFunnelId: z.string().optional(),
			}),
		}),
	);

export type InsertFlowTrigger = z.infer<typeof insertFlowTriggerSchema>;
export type CreateFlowTrigger = z.infer<typeof createFlowTriggerSchema>;
export type UpsertFlowTrigger = z.infer<typeof upsertFlowTriggerSchema>;
export type FlowTrigger = InferSelectModel<typeof Flow_Triggers>;
