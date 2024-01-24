import * as z from "zod"
import { pitchReviewStageSchema } from "./pitchreviewstage"
import { CampaignRelations, campaignRelationsSchema, campaignBaseSchema } from "./campaign"
import { UserRelations, userRelationsSchema, userBaseSchema } from "./user"
import { PlacementRelations, placementRelationsSchema, placementBaseSchema } from "./placement"

export const pitchReviewBaseSchema = z.object({
  id: z.string(),
  createdAt: z.date(),
  campaignId: z.string(),
  reviewerId: z.string(),
  stage: pitchReviewStageSchema,
  expiresAt: z.date(),
  review: z.string(),
  rating: z.number().int(),
  rejectReason: z.string().nullable(),
})

export interface PitchReviewRelations {
  campaign: z.infer<typeof campaignBaseSchema> & CampaignRelations
  reviewer: z.infer<typeof userBaseSchema> & UserRelations
  placements: (z.infer<typeof placementBaseSchema> & PlacementRelations)[]
}

export const pitchReviewRelationsSchema: z.ZodObject<{
  [K in keyof PitchReviewRelations]: z.ZodType<PitchReviewRelations[K]>
}> = z.object({
  campaign: z.lazy(() => campaignBaseSchema.merge(campaignRelationsSchema)),
  reviewer: z.lazy(() => userBaseSchema.merge(userRelationsSchema)),
  placements: z.lazy(() => placementBaseSchema.merge(placementRelationsSchema)).array(),
})

export const pitchReviewSchema = pitchReviewBaseSchema
  .merge(pitchReviewRelationsSchema)

export const pitchReviewCreateSchema = pitchReviewBaseSchema
  .extend({
    rejectReason: pitchReviewBaseSchema.shape.rejectReason.unwrap(),
  }).partial({
    id: true,
    createdAt: true,
    campaignId: true,
    reviewerId: true,
    rejectReason: true,
    placements: true,
  })

export const pitchReviewUpdateSchema = pitchReviewBaseSchema
  .extend({
    rejectReason: pitchReviewBaseSchema.shape.rejectReason.unwrap(),
  })
  .partial()
  
