import * as z from "zod"
import { UserRelations, userRelationsSchema, userBaseSchema } from "./user"
import { ArtistRelations, artistRelationsSchema, artistBaseSchema } from "./artist"
import { DemoRelations, demoRelationsSchema, demoBaseSchema } from "./demo"
import { GeoGroupRelations, geoGroupRelationsSchema, geoGroupBaseSchema } from "./geogroup"
import { InterestGroupRelations, interestGroupRelationsSchema, interestGroupBaseSchema } from "./interestgroup"
import { VidViewsGroupRelations, vidViewsGroupRelationsSchema, vidViewsGroupBaseSchema } from "./vidviewsgroup"
import { AdSetRelations, adSetRelationsSchema, adSetBaseSchema } from "./adset"
import { CloneAdSetRelations, cloneAdSetRelationsSchema, cloneAdSetBaseSchema } from "./cloneadset"
import { UpdateAdSetRelations, updateAdSetRelationsSchema, updateAdSetBaseSchema } from "./updateadset"

export const audienceBaseSchema = z.object({
  id: z.string(),
  createdAt: z.date(),
  name: z.string().nullable(),
  userId: z.string().nullable(),
  demoId: z.string(),
  metaId: z.string().nullable(),
  metaAudienceLowerBound: z.number().int().nullable(),
  metaAudienceUpperBound: z.number().int().nullable(),
  tikTokId: z.string().nullable(),
})

export interface AudienceRelations {
  user: (z.infer<typeof userBaseSchema> & UserRelations) | null
  artists: (z.infer<typeof artistBaseSchema> & ArtistRelations)[]
  demo: z.infer<typeof demoBaseSchema> & DemoRelations
  geoGroups: (z.infer<typeof geoGroupBaseSchema> & GeoGroupRelations)[]
  includeInterestGroups: (z.infer<typeof interestGroupBaseSchema> & InterestGroupRelations)[]
  excludeInterestGroups: (z.infer<typeof interestGroupBaseSchema> & InterestGroupRelations)[]
  includeVidViewsGroups: (z.infer<typeof vidViewsGroupBaseSchema> & VidViewsGroupRelations)[]
  excludeVidViewsGroups: (z.infer<typeof vidViewsGroupBaseSchema> & VidViewsGroupRelations)[]
  adSets: (z.infer<typeof adSetBaseSchema> & AdSetRelations)[]
  forAdSetClone: (z.infer<typeof cloneAdSetBaseSchema> & CloneAdSetRelations)[]
  forAdSetUpdate: (z.infer<typeof updateAdSetBaseSchema> & UpdateAdSetRelations)[]
}

export const audienceRelationsSchema: z.ZodObject<{
  [K in keyof AudienceRelations]: z.ZodType<AudienceRelations[K]>
}> = z.object({
  user: z.lazy(() => userBaseSchema.merge(userRelationsSchema)).nullable(),
  artists: z.lazy(() => artistBaseSchema.merge(artistRelationsSchema)).array(),
  demo: z.lazy(() => demoBaseSchema.merge(demoRelationsSchema)),
  geoGroups: z.lazy(() => geoGroupBaseSchema.merge(geoGroupRelationsSchema)).array(),
  includeInterestGroups: z.lazy(() => interestGroupBaseSchema.merge(interestGroupRelationsSchema)).array(),
  excludeInterestGroups: z.lazy(() => interestGroupBaseSchema.merge(interestGroupRelationsSchema)).array(),
  includeVidViewsGroups: z.lazy(() => vidViewsGroupBaseSchema.merge(vidViewsGroupRelationsSchema)).array(),
  excludeVidViewsGroups: z.lazy(() => vidViewsGroupBaseSchema.merge(vidViewsGroupRelationsSchema)).array(),
  adSets: z.lazy(() => adSetBaseSchema.merge(adSetRelationsSchema)).array(),
  forAdSetClone: z.lazy(() => cloneAdSetBaseSchema.merge(cloneAdSetRelationsSchema)).array(),
  forAdSetUpdate: z.lazy(() => updateAdSetBaseSchema.merge(updateAdSetRelationsSchema)).array(),
})

export const audienceSchema = audienceBaseSchema
  .merge(audienceRelationsSchema)

export const audienceCreateSchema = audienceBaseSchema
  .extend({
    name: audienceBaseSchema.shape.name.unwrap(),
    userId: audienceBaseSchema.shape.userId.unwrap(),
    metaId: audienceBaseSchema.shape.metaId.unwrap(),
    metaAudienceLowerBound: audienceBaseSchema.shape.metaAudienceLowerBound.unwrap(),
    metaAudienceUpperBound: audienceBaseSchema.shape.metaAudienceUpperBound.unwrap(),
    tikTokId: audienceBaseSchema.shape.tikTokId.unwrap(),
  }).partial({
    id: true,
    createdAt: true,
    name: true,
    user: true,
    userId: true,
    artists: true,
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
    forAdSetClone: true,
    forAdSetUpdate: true,
  })

export const audienceUpdateSchema = audienceBaseSchema
  .extend({
    name: audienceBaseSchema.shape.name.unwrap(),
    userId: audienceBaseSchema.shape.userId.unwrap(),
    metaId: audienceBaseSchema.shape.metaId.unwrap(),
    metaAudienceLowerBound: audienceBaseSchema.shape.metaAudienceLowerBound.unwrap(),
    metaAudienceUpperBound: audienceBaseSchema.shape.metaAudienceUpperBound.unwrap(),
    tikTokId: audienceBaseSchema.shape.tikTokId.unwrap(),
  })
  .partial()
  
