import type { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { EventReports } from '@barely/db/sql';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod/v4';

export const insertEventReportSchema = createInsertSchema(EventReports);
export const createEventReportSchema = insertEventReportSchema.omit({
	id: true,
});
export const updateEventReportSchema = insertEventReportSchema
	.partial()
	.required({ id: true });
export const upsertEventReportSchema = insertEventReportSchema.partial({
	id: true,
});

export const selectEventReportSchema = createSelectSchema(EventReports);

export type EventReport = InferSelectModel<typeof EventReports>;
export type InsertEventReport = InferInsertModel<typeof EventReports>;
export type CreateEventReport = z.infer<typeof createEventReportSchema>;

export const EventTrackingKeys = [
	'emailBroadcastId',
	'emailTemplateId',
	'fanId',
	'fbclid',
	'flowActionId',
	'landingPageId',
	'refererId',
	'metaCampaignId',
	'metaAdSetId',
	'metaAdId',
	'metaPlacementId',
] as const;

export type EventTrackingProps = Partial<
	Record<(typeof EventTrackingKeys)[number], string>
>;

export const eventReportSearchParamsSchema = z.object({
	emailBroadcastId: z.string().optional(),
	emailTemplateId: z.string().optional(),
	fanId: z.string().optional(),
	fbclid: z.string().optional(),
	flowActionId: z.string().optional(),
	landingPageId: z.string().optional(),
	refererId: z.string().optional(),
	metaCampaignId: z.string().optional(),
	metaAdSetId: z.string().optional(),
	metaAdId: z.string().optional(),
	metaPlacementId: z.string().optional(),
});
