import * as z from "zod"
import { vidViewsMetricSchema } from "./vidviewsmetric"
import { engagementRetentionSchema } from "./engagementretention"
import { FileRelations, fileRelationsSchema, fileBaseSchema } from "./file"
import { AudienceRelations, audienceRelationsSchema, audienceBaseSchema } from "./audience"
import { TeamRelations, teamRelationsSchema, teamBaseSchema } from "./team"

export const vidViewsGroupBaseSchema = z.object({
  id: z.string(),
  name: z.string(),
  metric: vidViewsMetricSchema,
  retention: engagementRetentionSchema,
  metaId: z.string(),
  metaName: z.string(),
  metaAudienceLowerBound: z.number().int(),
  metaAudienceUpperBound: z.number().int(),
  tiktokId: z.string(),
  tiktokName: z.string(),
  teamId: z.string().nullable(),
})

export interface VidViewsGroupRelations {
  vids: (z.infer<typeof fileBaseSchema> & FileRelations)[]
  includeInAudiences: (z.infer<typeof audienceBaseSchema> & AudienceRelations)[]
  excludeInAudiences: (z.infer<typeof audienceBaseSchema> & AudienceRelations)[]
  team: (z.infer<typeof teamBaseSchema> & TeamRelations) | null
}

export const vidViewsGroupRelationsSchema: z.ZodObject<{
  [K in keyof VidViewsGroupRelations]: z.ZodType<VidViewsGroupRelations[K]>
}> = z.object({
  vids: z.lazy(() => fileBaseSchema.merge(fileRelationsSchema)).array(),
  includeInAudiences: z.lazy(() => audienceBaseSchema.merge(audienceRelationsSchema)).array(),
  excludeInAudiences: z.lazy(() => audienceBaseSchema.merge(audienceRelationsSchema)).array(),
  team: z.lazy(() => teamBaseSchema.merge(teamRelationsSchema)).nullable(),
})

export const vidViewsGroupSchema = vidViewsGroupBaseSchema
  .merge(vidViewsGroupRelationsSchema)

export const vidViewsGroupCreateSchema = vidViewsGroupBaseSchema
  .extend({
    teamId: vidViewsGroupBaseSchema.shape.teamId.unwrap(),
  }).partial({
    id: true,
    vids: true,
    includeInAudiences: true,
    excludeInAudiences: true,
    team: true,
    teamId: true,
  })

export const vidViewsGroupUpdateSchema = vidViewsGroupBaseSchema
  .extend({
    teamId: vidViewsGroupBaseSchema.shape.teamId.unwrap(),
  })
  .partial()
  
