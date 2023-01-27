import * as z from "zod"
import { analyticsPlatformSchema } from "./analyticsplatform"
import { TeamRelations, teamRelationsSchema, teamBaseSchema } from "./team"
import { EventReportRelations, eventReportRelationsSchema, eventReportBaseSchema } from "./eventreport"

export const analyticsEndpointBaseSchema = z.object({
  id: z.string(),
  teamId: z.string(),
  platform: analyticsPlatformSchema,
  accessToken: z.string().nullable(),
})

export interface AnalyticsEndpointRelations {
  team: z.infer<typeof teamBaseSchema> & TeamRelations
  eventReports: (z.infer<typeof eventReportBaseSchema> & EventReportRelations)[]
}

export const analyticsEndpointRelationsSchema: z.ZodObject<{
  [K in keyof AnalyticsEndpointRelations]: z.ZodType<AnalyticsEndpointRelations[K]>
}> = z.object({
  team: z.lazy(() => teamBaseSchema.merge(teamRelationsSchema)),
  eventReports: z.lazy(() => eventReportBaseSchema.merge(eventReportRelationsSchema)).array(),
})

export const analyticsEndpointSchema = analyticsEndpointBaseSchema
  .merge(analyticsEndpointRelationsSchema)

export const analyticsEndpointCreateSchema = analyticsEndpointBaseSchema
  .extend({
    accessToken: analyticsEndpointBaseSchema.shape.accessToken.unwrap(),
  }).partial({
    teamId: true,
    accessToken: true,
    eventReports: true,
  })

export const analyticsEndpointUpdateSchema = analyticsEndpointBaseSchema
  .extend({
    accessToken: analyticsEndpointBaseSchema.shape.accessToken.unwrap(),
  })
  .partial()
  
