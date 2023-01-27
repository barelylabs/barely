import * as z from "zod"
import { UserRelations, userRelationsSchema, userBaseSchema } from "./user"
import { TeamRelations, teamRelationsSchema, teamBaseSchema } from "./team"
import { TrackRelations, trackRelationsSchema, trackBaseSchema } from "./track"
import { AdCampaignRelations, adCampaignRelationsSchema, adCampaignBaseSchema } from "./adcampaign"
import { VidRenderRelations, vidRenderRelationsSchema, vidRenderBaseSchema } from "./vidrender"

export const trackRenderBaseSchema = z.object({
  id: z.string(),
  createdById: z.string(),
  teamId: z.string(),
  trackId: z.string(),
  trackTrimIn: z.number(),
})

export interface TrackRenderRelations {
  createdBy: z.infer<typeof userBaseSchema> & UserRelations
  team: z.infer<typeof teamBaseSchema> & TeamRelations
  track: z.infer<typeof trackBaseSchema> & TrackRelations
  testForAdCampaigns: (z.infer<typeof adCampaignBaseSchema> & AdCampaignRelations)[]
  vidRenders: (z.infer<typeof vidRenderBaseSchema> & VidRenderRelations)[]
}

export const trackRenderRelationsSchema: z.ZodObject<{
  [K in keyof TrackRenderRelations]: z.ZodType<TrackRenderRelations[K]>
}> = z.object({
  createdBy: z.lazy(() => userBaseSchema.merge(userRelationsSchema)),
  team: z.lazy(() => teamBaseSchema.merge(teamRelationsSchema)),
  track: z.lazy(() => trackBaseSchema.merge(trackRelationsSchema)),
  testForAdCampaigns: z.lazy(() => adCampaignBaseSchema.merge(adCampaignRelationsSchema)).array(),
  vidRenders: z.lazy(() => vidRenderBaseSchema.merge(vidRenderRelationsSchema)).array(),
})

export const trackRenderSchema = trackRenderBaseSchema
  .merge(trackRenderRelationsSchema)

export const trackRenderCreateSchema = trackRenderBaseSchema.partial({
  id: true,
  createdById: true,
  teamId: true,
  trackId: true,
  testForAdCampaigns: true,
  vidRenders: true,
})

export const trackRenderUpdateSchema = trackRenderBaseSchema
  .partial()
  
