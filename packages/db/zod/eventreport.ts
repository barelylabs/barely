import * as z from "zod"
import { adPlatformSchema } from "./adplatform"
import { EventRelations, eventRelationsSchema, eventBaseSchema } from "./event"
import { RemarketingRelations, remarketingRelationsSchema, remarketingBaseSchema } from "./remarketing"

export const eventReportBaseSchema = z.object({
  createdAt: z.date(),
  eventId: z.number().int(),
  remarketingPlatform: adPlatformSchema,
  remarketingId: z.string(),
  error: z.string().nullable(),
})

export interface EventReportRelations {
  event: z.infer<typeof eventBaseSchema> & EventRelations
  remarketing: z.infer<typeof remarketingBaseSchema> & RemarketingRelations
}

export const eventReportRelationsSchema: z.ZodObject<{
  [K in keyof EventReportRelations]: z.ZodType<EventReportRelations[K]>
}> = z.object({
  event: z.lazy(() => eventBaseSchema.merge(eventRelationsSchema)),
  remarketing: z.lazy(() => remarketingBaseSchema.merge(remarketingRelationsSchema)),
})

export const eventReportSchema = eventReportBaseSchema
  .merge(eventReportRelationsSchema)

export const eventReportCreateSchema = eventReportBaseSchema
  .extend({
    error: eventReportBaseSchema.shape.error.unwrap(),
  }).partial({
    createdAt: true,
    eventId: true,
    remarketingPlatform: true,
    remarketingId: true,
    error: true,
  })

export const eventReportUpdateSchema = eventReportBaseSchema
  .extend({
    error: eventReportBaseSchema.shape.error.unwrap(),
  })
  .partial()
  
