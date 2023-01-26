import * as z from "zod"
import { analyticsPlatformSchema } from "./analyticsplatform"
import { UserRelations, userRelationsSchema, userBaseSchema } from "./user"
import { EventReportRelations, eventReportRelationsSchema, eventReportBaseSchema } from "./eventreport"

export const analyticsEndpointBaseSchema = z.object({
  id: z.string(),
  userId: z.string().nullable(),
  platform: analyticsPlatformSchema,
  accessToken: z.string().nullable(),
})

export interface AnalyticsEndpointRelations {
  user: (z.infer<typeof userBaseSchema> & UserRelations) | null
  eventReports: (z.infer<typeof eventReportBaseSchema> & EventReportRelations)[]
}

export const analyticsEndpointRelationsSchema: z.ZodObject<{
  [K in keyof AnalyticsEndpointRelations]: z.ZodType<AnalyticsEndpointRelations[K]>
}> = z.object({
  user: z.lazy(() => userBaseSchema.merge(userRelationsSchema)).nullable(),
  eventReports: z.lazy(() => eventReportBaseSchema.merge(eventReportRelationsSchema)).array(),
})

export const analyticsEndpointSchema = analyticsEndpointBaseSchema
  .merge(analyticsEndpointRelationsSchema)

export const analyticsEndpointCreateSchema = analyticsEndpointBaseSchema
  .extend({
    userId: analyticsEndpointBaseSchema.shape.userId.unwrap(),
    accessToken: analyticsEndpointBaseSchema.shape.accessToken.unwrap(),
  }).partial({
    user: true,
    userId: true,
    accessToken: true,
    eventReports: true,
  })

export const analyticsEndpointUpdateSchema = analyticsEndpointBaseSchema
  .extend({
    userId: analyticsEndpointBaseSchema.shape.userId.unwrap(),
    accessToken: analyticsEndpointBaseSchema.shape.accessToken.unwrap(),
  })
  .partial()
  
