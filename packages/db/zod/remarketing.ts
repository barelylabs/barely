import * as z from "zod"
import { adPlatformSchema } from "./adplatform"
import { UserRelations, userRelationsSchema, userBaseSchema } from "./user"
import { ArtistRemarketingRelations, artistRemarketingRelationsSchema, artistRemarketingBaseSchema } from "./artistremarketing"
import { EventReportRelations, eventReportRelationsSchema, eventReportBaseSchema } from "./eventreport"

export const remarketingBaseSchema = z.object({
  id: z.string(),
  userId: z.string(),
  platform: adPlatformSchema,
  accessToken: z.string().nullable(),
})

export interface RemarketingRelations {
  user: z.infer<typeof userBaseSchema> & UserRelations
  artistRemarketing: (z.infer<typeof artistRemarketingBaseSchema> & ArtistRemarketingRelations) | null
  eventReports: (z.infer<typeof eventReportBaseSchema> & EventReportRelations)[]
}

export const remarketingRelationsSchema: z.ZodObject<{
  [K in keyof RemarketingRelations]: z.ZodType<RemarketingRelations[K]>
}> = z.object({
  user: z.lazy(() => userBaseSchema.merge(userRelationsSchema)),
  artistRemarketing: z.lazy(() => artistRemarketingBaseSchema.merge(artistRemarketingRelationsSchema)).nullable(),
  eventReports: z.lazy(() => eventReportBaseSchema.merge(eventReportRelationsSchema)).array(),
})

export const remarketingSchema = remarketingBaseSchema
  .merge(remarketingRelationsSchema)

export const remarketingCreateSchema = remarketingBaseSchema
  .extend({
    accessToken: remarketingBaseSchema.shape.accessToken.unwrap(),
  }).partial({
    userId: true,
    accessToken: true,
    artistRemarketing: true,
    eventReports: true,
  })

export const remarketingUpdateSchema = remarketingBaseSchema
  .extend({
    accessToken: remarketingBaseSchema.shape.accessToken.unwrap(),
  })
  .partial()
  
