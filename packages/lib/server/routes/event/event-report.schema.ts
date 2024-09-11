import type { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

import { EventReports } from './event-report.sql';

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

export const eventReportSearchParamsSchema = z.object({
	fanId: z.string().optional(),
	fbclid: z.string().optional(),
	refererId: z.string().optional(),
});
