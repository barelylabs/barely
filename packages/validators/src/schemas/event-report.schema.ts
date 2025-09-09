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
	'sessionId',
	'metaCampaignId',
	'metaAdSetId',
	'metaAdId',
	'metaPlacementId',
	// Journey tracking fields
	'journeyId',
	'journeyOrigin',
	'journeySource',
	'journeyStep',
	'originalReferrerId',
] as const;

// export type EventTrackingProps = Partial<
// 	Record<(typeof EventTrackingKeys)[number], string | number>
// > & {
// 	journeyPath?: string[]; // Array needs special handling
// };

export interface EventTrackingProps {
	emailBroadcastId?: string;
	emailTemplateId?: string;
	fanId?: string;
	fbclid?: string;
	flowActionId?: string;
	landingPageId?: string;
	refererId?: string;
	sessionId?: string;
	sid?: string; // alias for sessionId in query params
	fid?: string; // alias for fanId in query params
	metaCampaignId?: string;
	metaAdSetId?: string;
	metaAdId?: string;
	metaPlacementId?: string;
	journeyId?: string;
	journeyOrigin?: string;
	journeySource?: string;
	journeyStep?: number;
	originalReferrerId?: string;
	journeyPath?: string[];
}

export const eventReportSearchParamsSchema = z.object({
	emailBroadcastId: z.string().optional(),
	emailTemplateId: z.string().optional(),
	fanId: z.string().optional(),
	fbclid: z.string().optional(),
	flowActionId: z.string().optional(),
	landingPageId: z.string().optional(),
	refererId: z.string().optional(),
	sessionId: z.string().optional(),
	sid: z.string().optional(), // alias for sessionId in query params
	fid: z.string().optional(), // alias for fanId in query params
	metaCampaignId: z.string().optional(),
	metaAdSetId: z.string().optional(),
	metaAdId: z.string().optional(),
	metaPlacementId: z.string().optional(),
	// Journey tracking params
	jid: z.string().optional(), // journey ID
	jsrc: z.string().optional(), // journey source
	jstep: z.string().optional(), // journey step
	rid: z.string().optional(), // referrer ID (current)
	orid: z.string().optional(), // original referrer ID
});
