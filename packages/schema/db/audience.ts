import * as z from "zod"
import { TeamRelations, teamRelationsSchema, teamBaseSchema } from "./team"
import { DemoRelations, demoRelationsSchema, demoBaseSchema } from "./demo"
import { GeoGroupRelations, geoGroupRelationsSchema, geoGroupBaseSchema } from "./geogroup"
import { InterestGroupRelations, interestGroupRelationsSchema, interestGroupBaseSchema } from "./interestgroup"
import { VidViewsGroupRelations, vidViewsGroupRelationsSchema, vidViewsGroupBaseSchema } from "./vidviewsgroup"
import { AdSetRelations, adSetRelationsSchema, adSetBaseSchema } from "./adset"
import { AdSetCloneRecordRelations, adSetCloneRecordRelationsSchema, adSetCloneRecordBaseSchema } from "./adsetclonerecord"
import { AdSetUpdateRecordRelations, adSetUpdateRecordRelationsSchema, adSetUpdateRecordBaseSchema } from "./adsetupdaterecord"

export const audienceBaseSchema = z.object({
  id: z.string(),
  createdAt: z.date(),
  name: z.string().nullable(),
  teamId: z.string(),
  demoId: z.string(),
  metaId: z.string().nullable(),
  metaAudienceLowerBound: z.number().int().nullable(),
  metaAudienceUpperBound: z.number().int().nullable(),
  tikTokId: z.string().nullable(),
})

export interface AudienceRelations {
  team: z.infer<typeof teamBaseSchema> & TeamRelations
  demo: z.infer<typeof demoBaseSchema> & DemoRelations
  geoGroups: (z.infer<typeof geoGroupBaseSchema> & GeoGroupRelations)[]
  includeInterestGroups: (z.infer<typeof interestGroupBaseSchema> & InterestGroupRelations)[]
  excludeInterestGroups: (z.infer<typeof interestGroupBaseSchema> & InterestGroupRelations)[]
  includeVidViewsGroups: (z.infer<typeof vidViewsGroupBaseSchema> & VidViewsGroupRelations)[]
  excludeVidViewsGroups: (z.infer<typeof vidViewsGroupBaseSchema> & VidViewsGroupRelations)[]
  adSets: (z.infer<typeof adSetBaseSchema> & AdSetRelations)[]
  forAdSetClones: (z.infer<typeof adSetCloneRecordBaseSchema> & AdSetCloneRecordRelations)[]
  forAdSetUpdates: (z.infer<typeof adSetUpdateRecordBaseSchema> & AdSetUpdateRecordRelations)[]
}

export const audienceRelationsSchema: z.ZodObject<{
  [K in keyof AudienceRelations]: z.ZodType<AudienceRelations[K]>
}> = z.object({
  team: z.lazy(() => teamBaseSchema.merge(teamRelationsSchema)),
  demo: z.lazy(() => demoBaseSchema.merge(demoRelationsSchema)),
  geoGroups: z.lazy(() => geoGroupBaseSchema.merge(geoGroupRelationsSchema)).array(),
  includeInterestGroups: z.lazy(() => interestGroupBaseSchema.merge(interestGroupRelationsSchema)).array(),
  excludeInterestGroups: z.lazy(() => interestGroupBaseSchema.merge(interestGroupRelationsSchema)).array(),
  includeVidViewsGroups: z.lazy(() => vidViewsGroupBaseSchema.merge(vidViewsGroupRelationsSchema)).array(),
  excludeVidViewsGroups: z.lazy(() => vidViewsGroupBaseSchema.merge(vidViewsGroupRelationsSchema)).array(),
  adSets: z.lazy(() => adSetBaseSchema.merge(adSetRelationsSchema)).array(),
  forAdSetClones: z.lazy(() => adSetCloneRecordBaseSchema.merge(adSetCloneRecordRelationsSchema)).array(),
  forAdSetUpdates: z.lazy(() => adSetUpdateRecordBaseSchema.merge(adSetUpdateRecordRelationsSchema)).array(),
})

export const audienceSchema = audienceBaseSchema
  .merge(audienceRelationsSchema)

export const audienceCreateSchema = audienceBaseSchema
  .extend({
    name: audienceBaseSchema.shape.name.unwrap(),
    metaId: audienceBaseSchema.shape.metaId.unwrap(),
    metaAudienceLowerBound: audienceBaseSchema.shape.metaAudienceLowerBound.unwrap(),
    metaAudienceUpperBound: audienceBaseSchema.shape.metaAudienceUpperBound.unwrap(),
    tikTokId: audienceBaseSchema.shape.tikTokId.unwrap(),
  }).partial({
    id: true,
    createdAt: true,
    name: true,
    teamId: true,
    demoId: true,
    geoGroups: true,
    includeInterestGroups: true,
    excludeInterestGroups: true,
    includeVidViewsGroups: true,
    excludeVidViewsGroups: true,
    metaId: true,
    metaAudienceLowerBound: true,
    metaAudienceUpperBound: true,
    tikTokId: true,
    adSets: true,
    forAdSetClones: true,
    forAdSetUpdates: true,
  })

export const audienceUpdateSchema = audienceBaseSchema
  .extend({
    name: audienceBaseSchema.shape.name.unwrap(),
    metaId: audienceBaseSchema.shape.metaId.unwrap(),
    metaAudienceLowerBound: audienceBaseSchema.shape.metaAudienceLowerBound.unwrap(),
    metaAudienceUpperBound: audienceBaseSchema.shape.metaAudienceUpperBound.unwrap(),
    tikTokId: audienceBaseSchema.shape.tikTokId.unwrap(),
  })
  .partial()
  
