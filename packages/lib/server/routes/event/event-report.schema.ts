import type { InferModel } from 'drizzle-orm';
import type { z } from 'zod';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

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

export type EventReport = InferModel<typeof EventReports, 'select'>;
export type InsertEventReport = InferModel<typeof EventReports, 'insert'>;
export type CreateEventReport = z.infer<typeof createEventReportSchema>;
