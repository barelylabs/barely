import type { InferSelectModel } from 'drizzle-orm';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

import { querySelectionSchema } from '../../../utils/zod-helpers';
import { insertEmailTemplateSchema } from '../email-template/email-template.schema';
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
		enabled: true,

		waitFor: true,
		waitForUnits: true,
	})
	.extend({
		type: z.literal('wait'),
	});

export const flowForm_waitSchema = z.object({
	waitFor: z.coerce.number().min(1),
	waitForUnits: insertFlowActionSchema_notStrict.shape.waitForUnits.unwrap().unwrap(),
	enabled: z.boolean(),
});

export type InsertFlowAction_Wait = z.infer<typeof insertFlowAction_waitSchema>;

// send email from template
const insertFlowAction_sendEmailSchema = insertFlowActionSchema_notStrict
	.partial()
	.required({
		id: true,
		flowId: true,
		enabled: true,
	})
	.extend({
		type: z.literal('sendEmail'),
		emailTemplate: insertEmailTemplateSchema.omit({ workspaceId: true }),
	});

export const flowForm_sendEmailSchema = insertEmailTemplateSchema
	.partial({
		workspaceId: true,
	})
	.extend({
		enabled: z.boolean(),
		sendTestEmailTo: z.string().email().optional(),
	});

export type InsertFlowAction_SendEmail = z.infer<typeof insertFlowAction_sendEmailSchema>;

// send email from template group
const insertFlowAction_sendEmailFromTemplateGroupSchema = insertFlowActionSchema_notStrict
	.partial()
	.required({
		id: true,
		flowId: true,
		enabled: true,
	})
	.extend({
		type: z.literal('sendEmailFromTemplateGroup'),
		// emailTemplateGroup: insertEmailTemplateGroupSchema.omit({ workspaceId: true }),
	});

export const flowForm_sendEmailFromTemplateGroupSchema = z.object({
	emailTemplateGroupId: z.string(),
	enabled: z.boolean(),
});

export type InsertFlowAction_SendEmailFromTemplateGroup = z.infer<
	typeof insertFlowAction_sendEmailFromTemplateGroupSchema
>;

// boolean
const insertFlowAction_booleanSchema = insertFlowActionSchema_notStrict
	.partial()
	.required({
		id: true,
		flowId: true,
		enabled: true,
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
	enabled: z.boolean(),
});

// add to mailchimp audience
const insertFlowAction_addToMailchimpAudienceSchema = insertFlowActionSchema_notStrict
	.partial()
	.required({
		id: true,
		flowId: true,
		mailchimpAudienceId: true,
		enabled: true,
	})
	.extend({
		type: z.literal('addToMailchimpAudience'),
	});

export const flowForm_addToMailchimpAudienceSchema = z.object({
	mailchimpAudienceId:
		insertFlowAction_addToMailchimpAudienceSchema.shape.mailchimpAudienceId.unwrap(),
	enabled: z.boolean(),
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

export type InsertFlowAction_Empty = z.infer<typeof insertFlowAction_emptySchema>;

// upsert flow action
const insertFlowActionSchema = z.union([
	insertFlowAction_emptySchema,
	insertFlowAction_addToMailchimpAudienceSchema,
	insertFlowAction_booleanSchema,
	insertFlowAction_sendEmailSchema,
	insertFlowAction_sendEmailFromTemplateGroupSchema,
	insertFlowAction_waitSchema,
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
	testFanId: z.string().optional(),
});

// flow runs
export const insertFlowRunSchema = createInsertSchema(Flow_Runs);
export type InsertFlowRun = z.infer<typeof insertFlowRunSchema>;
export type FlowRun = InferSelectModel<typeof Flow_Runs>;

// flow run actions
export const insertFlowRunActionSchema = createInsertSchema(FlowRunActions);
export type InsertFlowRunAction = z.infer<typeof insertFlowRunActionSchema>;
export type FlowRunAction = InferSelectModel<typeof FlowRunActions>;
