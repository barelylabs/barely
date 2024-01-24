import * as z from "zod"
import { analyticsPlatformSchema } from "./analyticsplatform"
import { EventRelations, eventRelationsSchema, eventBaseSchema } from "./event"
import { AnalyticsEndpointRelations, analyticsEndpointRelationsSchema, analyticsEndpointBaseSchema } from "./analyticsendpoint"

export const eventReportBaseSchema = z.object({
  createdAt: z.date(),
  eventId: z.number().int(),
  analyticsPlatform: analyticsPlatformSchema,
  analyticsId: z.string(),
  error: z.string().nullable(),
})

export interface EventReportRelations {
  event: z.infer<typeof eventBaseSchema> & EventRelations
  analyticsEndpoint: z.infer<typeof analyticsEndpointBaseSchema> & AnalyticsEndpointRelations
}

export const eventReportRelationsSchema: z.ZodObject<{
  [K in keyof EventReportRelations]: z.ZodType<EventReportRelations[K]>
}> = z.object({
  event: z.lazy(() => eventBaseSchema.merge(eventRelationsSchema)),
  analyticsEndpoint: z.lazy(() => analyticsEndpointBaseSchema.merge(analyticsEndpointRelationsSchema)),
})

export const eventReportSchema = eventReportBaseSchema
  .merge(eventReportRelationsSchema)

export const eventReportCreateSchema = eventReportBaseSchema
  .extend({
    error: eventReportBaseSchema.shape.error.unwrap(),
  }).partial({
    createdAt: true,
    eventId: true,
    analyticsPlatform: true,
    analyticsId: true,
    error: true,
  })

export const eventReportUpdateSchema = eventReportBaseSchema
  .extend({
    error: eventReportBaseSchema.shape.error.unwrap(),
  })
  .partial()
  
