import * as z from "zod"
import { adStatusSchema } from "./adstatus"
import { AdCampaignRelations, adCampaignRelationsSchema, adCampaignBaseSchema } from "./adcampaign"
import { AudienceRelations, audienceRelationsSchema, audienceBaseSchema } from "./audience"
import { AdRelations, adRelationsSchema, adBaseSchema } from "./ad"
import { AdSetUpdateRecordRelations, adSetUpdateRecordRelationsSchema, adSetUpdateRecordBaseSchema } from "./adsetupdaterecord"
import { AdSetCloneRecordRelations, adSetCloneRecordRelationsSchema, adSetCloneRecordBaseSchema } from "./adsetclonerecord"

export const adSetBaseSchema = z.object({
  id: z.string(),
  createdAt: z.date(),
  adCampaignId: z.string(),
  audienceId: z.string(),
  metaId: z.string().nullable(),
  tikTokId: z.string().nullable(),
  fbFeed: z.boolean(),
  fbVideoFeeds: z.boolean(),
  fbMarketplace: z.boolean(),
  fbStories: z.boolean(),
  igFeed: z.boolean(),
  igStories: z.boolean(),
  igReels: z.boolean(),
  tiktokFeed: z.boolean(),
  metaStatus: adStatusSchema,
  tikTokStatus: adStatusSchema,
})

export interface AdSetRelations {
  adCampaign: z.infer<typeof adCampaignBaseSchema> & AdCampaignRelations
  audience: z.infer<typeof audienceBaseSchema> & AudienceRelations
  ads: (z.infer<typeof adBaseSchema> & AdRelations)[]
  updates: (z.infer<typeof adSetUpdateRecordBaseSchema> & AdSetUpdateRecordRelations)[]
  parentAdSetForClone: (z.infer<typeof adSetCloneRecordBaseSchema> & AdSetCloneRecordRelations)[]
  childAdSetFromClone: (z.infer<typeof adSetCloneRecordBaseSchema> & AdSetCloneRecordRelations)[]
}

export const adSetRelationsSchema: z.ZodObject<{
  [K in keyof AdSetRelations]: z.ZodType<AdSetRelations[K]>
}> = z.object({
  adCampaign: z.lazy(() => adCampaignBaseSchema.merge(adCampaignRelationsSchema)),
  audience: z.lazy(() => audienceBaseSchema.merge(audienceRelationsSchema)),
  ads: z.lazy(() => adBaseSchema.merge(adRelationsSchema)).array(),
  updates: z.lazy(() => adSetUpdateRecordBaseSchema.merge(adSetUpdateRecordRelationsSchema)).array(),
  parentAdSetForClone: z.lazy(() => adSetCloneRecordBaseSchema.merge(adSetCloneRecordRelationsSchema)).array(),
  childAdSetFromClone: z.lazy(() => adSetCloneRecordBaseSchema.merge(adSetCloneRecordRelationsSchema)).array(),
})

export const adSetSchema = adSetBaseSchema
  .merge(adSetRelationsSchema)

export const adSetCreateSchema = adSetBaseSchema
  .extend({
    metaId: adSetBaseSchema.shape.metaId.unwrap(),
    tikTokId: adSetBaseSchema.shape.tikTokId.unwrap(),
  }).partial({
    id: true,
    createdAt: true,
    adCampaignId: true,
    audienceId: true,
    ads: true,
    updates: true,
    parentAdSetForClone: true,
    childAdSetFromClone: true,
    metaId: true,
    tikTokId: true,
  })

export const adSetUpdateSchema = adSetBaseSchema
  .extend({
    metaId: adSetBaseSchema.shape.metaId.unwrap(),
    tikTokId: adSetBaseSchema.shape.tikTokId.unwrap(),
  })
  .partial()
  
