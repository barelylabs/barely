import type { InferSelectModel } from 'drizzle-orm';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

import { querySelectionSchema } from '../../../utils/zod-helpers';
import { insertEmailSchema } from '../email/email.schema';
import {
	Flow_Actions,
	Flow_Runs,
	Flow_Triggers,
	FlowRunActions,
	Flows,
} from './flow.sql';

export const insertFlowSchema = createInsertSchema(Flows);
export const createFlowSchema = insertFlowSchema
	.omit({
		id: true,
	})
	.partial({
		workspaceId: true,
	});
export const updateFlowSchema = insertFlowSchema.partial({
	// id: true,
	workspaceId: true,
});

export type InsertFlow = z.infer<typeof insertFlowSchema>;
export type CreateFlow = z.infer<typeof createFlowSchema>;
export type UpdateFlow = z.infer<typeof updateFlowSchema>;
export type Flow = InferSelectModel<typeof Flows>;

// forms
export const flowFilterParamsSchema = z.object({
	search: z.string().optional(),
	showArchived: z.boolean().optional(),
});
export const flowSearchParamsSchema = flowFilterParamsSchema.extend({
	selectedFlowIds: querySelectionSchema.optional(),
});

export const selectWorkspaceFlowsSchema = flowFilterParamsSchema.extend({
	handle: z.string(),
	cursor: z.object({ id: z.string(), createdAt: z.coerce.date() }).optional(),
	limit: z.coerce.number().min(1).max(100).optional().default(20),
});

// Flow Action
export const insertFlowActionSchema_notStrict = createInsertSchema(Flow_Actions);
// export const updateFlowAction_sendEmailSchema = insertFlowActionSchema_notStrict
// 	.partial()
// 	.required({
// 		id: true,
// 	})
// 	.merge(
// 		z.object({
// 			email: updateEmailSchema,
// 		}),
// 	);

// export const updateFlowAction_booleanSchema = insertFlowActionSchema_notStrict
// 	.partial()
// 	.required({
// 		id: true,
// 	})
// 	.merge(
// 		z.object({
// 			data: insertFlowActionSchema_notStrict.partial().required({
// 				booleanCondition: true,
// 			}),
// 		}),
// 	);

export type InsertFlowAction_NotStrict = z.infer<typeof insertFlowActionSchema_notStrict>;
export type FlowAction = InferSelectModel<typeof Flow_Actions>;

// Flow Trigger
export const insertFlowTriggerSchema = createInsertSchema(Flow_Triggers);
export const updateFlowTriggerSchema = insertFlowTriggerSchema
	.partial()
	.required({
		id: true,
	})
	.merge(
		z.object({
			// data: z.object({
			// 	trigger: z.enum(FLOW_TRIGGERS),
			// 	cartFunnelId: z.string().optional(),
			// }),
			data: insertFlowTriggerSchema.partial().required({
				type: true,
			}),
		}),
	);

export type InsertFlowTrigger = z.infer<typeof insertFlowTriggerSchema>;
export type FlowTrigger = InferSelectModel<typeof Flow_Triggers>;

/* flow builder */

// wait
const insertFlowAction_waitSchema = insertFlowActionSchema_notStrict
	.partial()
	.required({
		id: true,
		flowId: true,

		waitFor: true,
		waitForUnits: true,
	})
	.extend({
		type: z.literal('wait'),
	});

export const flowForm_waitSchema = z.object({
	waitFor: z.coerce.number().min(1),
	waitForUnits: insertFlowActionSchema_notStrict.shape.waitForUnits.unwrap().unwrap(),
});

// send email
const insertFlowAction_sendEmailSchema = insertFlowActionSchema_notStrict
	.partial()
	.required({
		id: true,
		flowId: true,
	})
	.extend({
		type: z.literal('sendEmail'),
		email: insertEmailSchema.omit({ workspaceId: true }),
	});

export const flowForm_sendEmailSchema = insertEmailSchema
	.partial({
		workspaceId: true,
	})
	.extend({
		sendTestEmailTo: z.string().email().optional(),
	});

// boolean
const insertFlowAction_booleanSchema = insertFlowActionSchema_notStrict
	.partial()
	.required({
		id: true,
		flowId: true,
		booleanCondition: true,
	})
	.extend({
		type: z.literal('boolean'),
	});

export const flowForm_booleanSchema = z.object({
	booleanCondition: insertFlowAction_booleanSchema.shape.booleanCondition.unwrap(),
	productId: insertFlowAction_booleanSchema.shape.productId.optional(),
	cartFunnelId: insertFlowAction_booleanSchema.shape.cartFunnelId.optional(),
	totalOrderAmount: insertFlowAction_booleanSchema.shape.totalOrderAmount.optional(),
});

// add to mailchimp audience
const insertFlowAction_addToMailchimpAudienceSchema = insertFlowActionSchema_notStrict
	.partial()
	.required({
		id: true,
		flowId: true,
		mailchimpAudienceId: true,
	})
	.extend({
		type: z.literal('addToMailchimpAudience'),
	});

export const flowForm_addToMailchimpAudienceSchema = z.object({
	mailchimpAudienceId:
		insertFlowAction_addToMailchimpAudienceSchema.shape.mailchimpAudienceId.unwrap(),
});

// empty
const insertFlowAction_emptySchema = insertFlowActionSchema_notStrict
	.partial()
	.required({
		id: true,
		flowId: true,
	})
	.extend({
		type: z.literal('empty'),
	});

// upsert flow action
const insertFlowActionSchema = z.union([
	insertFlowAction_emptySchema,
	insertFlowAction_booleanSchema,
	insertFlowAction_sendEmailSchema,
	insertFlowAction_waitSchema,
	insertFlowAction_addToMailchimpAudienceSchema,
]);

export type InsertFlowAction = z.infer<typeof insertFlowActionSchema>;

export const updateFlowAndNodesSchema = updateFlowSchema.extend({
	trigger: insertFlowTriggerSchema,
	actions: z.array(insertFlowActionSchema),
	edges: z.array(
		z.object({
			id: z.string(),
			source: z.string(),
			target: z.string(),
			deletable: z.boolean().optional(),
			type: z.enum(['simple', 'boolean']),
			data: z
				.object({
					boolean: z.boolean().optional(),
				})
				.optional(),
		}),
	),
});

// flow runs
export const insertFlowRunSchema = createInsertSchema(Flow_Runs);
export type InsertFlowRun = z.infer<typeof insertFlowRunSchema>;
export type FlowRun = InferSelectModel<typeof Flow_Runs>;

// flow run actions
export const insertFlowRunActionSchema = createInsertSchema(FlowRunActions);
export type InsertFlowRunAction = z.infer<typeof insertFlowRunActionSchema>;
export type FlowRunAction = InferSelectModel<typeof FlowRunActions>;
