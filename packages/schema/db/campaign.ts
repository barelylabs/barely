import * as z from "zod"
import { campaignTypeSchema } from "./campaigntype"
import { campaignStageSchema } from "./campaignstage"
import { UserRelations, userRelationsSchema, userBaseSchema } from "./user"
import { ArtistRelations, artistRelationsSchema, artistBaseSchema } from "./artist"
import { TrackRelations, trackRelationsSchema, trackBaseSchema } from "./track"
import { PlaylistRelations, playlistRelationsSchema, playlistBaseSchema } from "./playlist"
import { CampaignUpdateRecordRelations, campaignUpdateRecordRelationsSchema, campaignUpdateRecordBaseSchema } from "./campaignupdaterecord"
import { AdCampaignRelations, adCampaignRelationsSchema, adCampaignBaseSchema } from "./adcampaign"
import { PitchReviewRelations, pitchReviewRelationsSchema, pitchReviewBaseSchema } from "./pitchreview"
import { LineItemRelations, lineItemRelationsSchema, lineItemBaseSchema } from "./lineitem"

export const campaignBaseSchema = z.object({
  id: z.string(),
  createdAt: z.date(),
  endDate: z.date().nullable(),
  type: campaignTypeSchema,
  stage: campaignStageSchema,
  createdById: z.string(),
  artistId: z.string(),
  trackId: z.string(),
  playlistId: z.string().nullable(),
})

export interface CampaignRelations {
  createdBy: z.infer<typeof userBaseSchema> & UserRelations
  artist: z.infer<typeof artistBaseSchema> & ArtistRelations
  track: z.infer<typeof trackBaseSchema> & TrackRelations
  playlist: (z.infer<typeof playlistBaseSchema> & PlaylistRelations) | null
  updates: (z.infer<typeof campaignUpdateRecordBaseSchema> & CampaignUpdateRecordRelations)[]
  adCampaigns: (z.infer<typeof adCampaignBaseSchema> & AdCampaignRelations)[]
  pitchReviews: (z.infer<typeof pitchReviewBaseSchema> & PitchReviewRelations)[]
  lineItems: (z.infer<typeof lineItemBaseSchema> & LineItemRelations)[]
}

export const campaignRelationsSchema: z.ZodObject<{
  [K in keyof CampaignRelations]: z.ZodType<CampaignRelations[K]>
}> = z.object({
  createdBy: z.lazy(() => userBaseSchema.merge(userRelationsSchema)),
  artist: z.lazy(() => artistBaseSchema.merge(artistRelationsSchema)),
  track: z.lazy(() => trackBaseSchema.merge(trackRelationsSchema)),
  playlist: z.lazy(() => playlistBaseSchema.merge(playlistRelationsSchema)).nullable(),
  updates: z.lazy(() => campaignUpdateRecordBaseSchema.merge(campaignUpdateRecordRelationsSchema)).array(),
  adCampaigns: z.lazy(() => adCampaignBaseSchema.merge(adCampaignRelationsSchema)).array(),
  pitchReviews: z.lazy(() => pitchReviewBaseSchema.merge(pitchReviewRelationsSchema)).array(),
  lineItems: z.lazy(() => lineItemBaseSchema.merge(lineItemRelationsSchema)).array(),
})

export const campaignSchema = campaignBaseSchema
  .merge(campaignRelationsSchema)

export const campaignCreateSchema = campaignBaseSchema
  .extend({
    endDate: campaignBaseSchema.shape.endDate.unwrap(),
    playlistId: campaignBaseSchema.shape.playlistId.unwrap(),
  }).partial({
    id: true,
    createdAt: true,
    endDate: true,
    createdById: true,
    artistId: true,
    trackId: true,
    playlist: true,
    playlistId: true,
    updates: true,
    adCampaigns: true,
    pitchReviews: true,
    lineItems: true,
  })

export const campaignUpdateSchema = campaignBaseSchema
  .extend({
    endDate: campaignBaseSchema.shape.endDate.unwrap(),
    playlistId: campaignBaseSchema.shape.playlistId.unwrap(),
  })
  .partial()
  
