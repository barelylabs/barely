import * as z from "zod"
import { adPlatformSchema } from "./adplatform"
import { UserRelations, userRelationsSchema, userBaseSchema } from "./user"
import { ArtistRemarketingRelations, artistRemarketingRelationsSchema, artistRemarketingBaseSchema } from "./artistremarketing"
import { EventReportRelations, eventReportRelationsSchema, eventReportBaseSchema } from "./eventreport"

export const remarketingBaseSchema = z.object({
  id: z.string(),
  userId: z.string().nullable(),
  platform: adPlatformSchema,
  accessToken: z.string().nullable(),
})

export interface RemarketingRelations {
  user: (z.infer<typeof userBaseSchema> & UserRelations) | null
  artistRemarketing: (z.infer<typeof artistRemarketingBaseSchema> & ArtistRemarketingRelations) | null
  eventReports: (z.infer<typeof eventReportBaseSchema> & EventReportRelations)[]
}

export const remarketingRelationsSchema: z.ZodObject<{
  [K in keyof RemarketingRelations]: z.ZodType<RemarketingRelations[K]>
}> = z.object({
  user: z.lazy(() => userBaseSchema.merge(userRelationsSchema)).nullable(),
  artistRemarketing: z.lazy(() => artistRemarketingBaseSchema.merge(artistRemarketingRelationsSchema)).nullable(),
  eventReports: z.lazy(() => eventReportBaseSchema.merge(eventReportRelationsSchema)).array(),
})

export const remarketingSchema = remarketingBaseSchema
  .merge(remarketingRelationsSchema)

export const remarketingCreateSchema = remarketingBaseSchema
  .extend({
    userId: remarketingBaseSchema.shape.userId.unwrap(),
    accessToken: remarketingBaseSchema.shape.accessToken.unwrap(),
  }).partial({
    user: true,
    userId: true,
    accessToken: true,
    artistRemarketing: true,
    eventReports: true,
  })

export const remarketingUpdateSchema = remarketingBaseSchema
  .extend({
    userId: remarketingBaseSchema.shape.userId.unwrap(),
    accessToken: remarketingBaseSchema.shape.accessToken.unwrap(),
  })
  .partial()
  
