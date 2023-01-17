import * as z from "zod"
import { adStatusSchema } from "./adstatus"
import { CampaignRelations, campaignRelationsSchema, campaignBaseSchema } from "./campaign"
import { AccountRelations, accountRelationsSchema, accountBaseSchema } from "./account"
import { DemoRelations, demoRelationsSchema, demoBaseSchema } from "./demo"
import { GeoGroupRelations, geoGroupRelationsSchema, geoGroupBaseSchema } from "./geogroup"
import { InterestGroupRelations, interestGroupRelationsSchema, interestGroupBaseSchema } from "./interestgroup"
import { HeadlineRelations, headlineRelationsSchema, headlineBaseSchema } from "./headline"
import { VidRenderRelations, vidRenderRelationsSchema, vidRenderBaseSchema } from "./vidrender"
import { TrackRenderRelations, trackRenderRelationsSchema, trackRenderBaseSchema } from "./trackrender"
import { PlaylistCoverRenderRelations, playlistCoverRenderRelationsSchema, playlistCoverRenderBaseSchema } from "./playlistcoverrender"
import { AdSetRelations, adSetRelationsSchema, adSetBaseSchema } from "./adset"

export const adCampaignBaseSchema = z.object({
  id: z.string(),
  name: z.string(),
  createdAt: z.date(),
  campaignId: z.string(),
  startDate: z.date(),
  endDate: z.date().nullable(),
  metaAdAccountId: z.string(),
  tikTokAdAccountId: z.string(),
  metaId: z.string().nullable(),
  tikTokId: z.string().nullable(),
  metaDailyBudget: z.number().int().nullable(),
  tikTokDailyBudget: z.number().int().nullable(),
  totalLifetimeBudget: z.number().int().nullable(),
  metaLifetimeBudget: z.number().int().nullable(),
  tikTokLifetimeBudget: z.number().int().nullable(),
  metaTriggerFraction: z.number().nullable(),
  tikTokTriggerFraction: z.number().nullable(),
  splitTestDemos: z.boolean(),
  splitTestGeoGroups: z.boolean(),
  splitTestInterestGroups: z.boolean(),
  status: adStatusSchema,
})

export interface AdCampaignRelations {
  campaign: z.infer<typeof campaignBaseSchema> & CampaignRelations
  metaAdAccount: z.infer<typeof accountBaseSchema> & AccountRelations
  tikTokAdAccount: z.infer<typeof accountBaseSchema> & AccountRelations
  testDemos: (z.infer<typeof demoBaseSchema> & DemoRelations)[]
  testGeoGroups: (z.infer<typeof geoGroupBaseSchema> & GeoGroupRelations)[]
  testInterestGroups: (z.infer<typeof interestGroupBaseSchema> & InterestGroupRelations)[]
  testHeadlines: (z.infer<typeof headlineBaseSchema> & HeadlineRelations)[]
  testVidRenders: (z.infer<typeof vidRenderBaseSchema> & VidRenderRelations)[]
  testTrackRenders: (z.infer<typeof trackRenderBaseSchema> & TrackRenderRelations)[]
  testPlaylistCoverRenders: (z.infer<typeof playlistCoverRenderBaseSchema> & PlaylistCoverRenderRelations)[]
  adSets: (z.infer<typeof adSetBaseSchema> & AdSetRelations)[]
}

export const adCampaignRelationsSchema: z.ZodObject<{
  [K in keyof AdCampaignRelations]: z.ZodType<AdCampaignRelations[K]>
}> = z.object({
  campaign: z.lazy(() => campaignBaseSchema.merge(campaignRelationsSchema)),
  metaAdAccount: z.lazy(() => accountBaseSchema.merge(accountRelationsSchema)),
  tikTokAdAccount: z.lazy(() => accountBaseSchema.merge(accountRelationsSchema)),
  testDemos: z.lazy(() => demoBaseSchema.merge(demoRelationsSchema)).array(),
  testGeoGroups: z.lazy(() => geoGroupBaseSchema.merge(geoGroupRelationsSchema)).array(),
  testInterestGroups: z.lazy(() => interestGroupBaseSchema.merge(interestGroupRelationsSchema)).array(),
  testHeadlines: z.lazy(() => headlineBaseSchema.merge(headlineRelationsSchema)).array(),
  testVidRenders: z.lazy(() => vidRenderBaseSchema.merge(vidRenderRelationsSchema)).array(),
  testTrackRenders: z.lazy(() => trackRenderBaseSchema.merge(trackRenderRelationsSchema)).array(),
  testPlaylistCoverRenders: z.lazy(() => playlistCoverRenderBaseSchema.merge(playlistCoverRenderRelationsSchema)).array(),
  adSets: z.lazy(() => adSetBaseSchema.merge(adSetRelationsSchema)).array(),
})

export const adCampaignSchema = adCampaignBaseSchema
  .merge(adCampaignRelationsSchema)

export const adCampaignCreateSchema = adCampaignBaseSchema
  .extend({
    endDate: adCampaignBaseSchema.shape.endDate.unwrap(),
    metaId: adCampaignBaseSchema.shape.metaId.unwrap(),
    tikTokId: adCampaignBaseSchema.shape.tikTokId.unwrap(),
    metaDailyBudget: adCampaignBaseSchema.shape.metaDailyBudget.unwrap(),
    tikTokDailyBudget: adCampaignBaseSchema.shape.tikTokDailyBudget.unwrap(),
    totalLifetimeBudget: adCampaignBaseSchema.shape.totalLifetimeBudget.unwrap(),
    metaLifetimeBudget: adCampaignBaseSchema.shape.metaLifetimeBudget.unwrap(),
    tikTokLifetimeBudget: adCampaignBaseSchema.shape.tikTokLifetimeBudget.unwrap(),
    metaTriggerFraction: adCampaignBaseSchema.shape.metaTriggerFraction.unwrap(),
    tikTokTriggerFraction: adCampaignBaseSchema.shape.tikTokTriggerFraction.unwrap(),
  }).partial({
    id: true,
    createdAt: true,
    campaignId: true,
    endDate: true,
    metaAdAccountId: true,
    tikTokAdAccountId: true,
    metaId: true,
    tikTokId: true,
    metaDailyBudget: true,
    tikTokDailyBudget: true,
    totalLifetimeBudget: true,
    metaLifetimeBudget: true,
    tikTokLifetimeBudget: true,
    metaTriggerFraction: true,
    tikTokTriggerFraction: true,
    testDemos: true,
    testGeoGroups: true,
    testInterestGroups: true,
    testHeadlines: true,
    testVidRenders: true,
    testTrackRenders: true,
    testPlaylistCoverRenders: true,
    splitTestDemos: true,
    splitTestGeoGroups: true,
    splitTestInterestGroups: true,
    adSets: true,
  })

export const adCampaignUpdateSchema = adCampaignBaseSchema
  .extend({
    endDate: adCampaignBaseSchema.shape.endDate.unwrap(),
    metaId: adCampaignBaseSchema.shape.metaId.unwrap(),
    tikTokId: adCampaignBaseSchema.shape.tikTokId.unwrap(),
    metaDailyBudget: adCampaignBaseSchema.shape.metaDailyBudget.unwrap(),
    tikTokDailyBudget: adCampaignBaseSchema.shape.tikTokDailyBudget.unwrap(),
    totalLifetimeBudget: adCampaignBaseSchema.shape.totalLifetimeBudget.unwrap(),
    metaLifetimeBudget: adCampaignBaseSchema.shape.metaLifetimeBudget.unwrap(),
    tikTokLifetimeBudget: adCampaignBaseSchema.shape.tikTokLifetimeBudget.unwrap(),
    metaTriggerFraction: adCampaignBaseSchema.shape.metaTriggerFraction.unwrap(),
    tikTokTriggerFraction: adCampaignBaseSchema.shape.tikTokTriggerFraction.unwrap(),
  })
  .partial()
  
