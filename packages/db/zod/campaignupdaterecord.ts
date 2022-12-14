import * as z from "zod"
import { campaignStageSchema } from "./campaignstage"
import { CampaignRelations, campaignRelationsSchema, campaignBaseSchema } from "./campaign"

export const campaignUpdateRecordBaseSchema = z.object({
  id: z.string(),
  createdAt: z.date(),
  campaignId: z.string(),
  stage: campaignStageSchema.nullable(),
  dailyBudget: z.number().nullable(),
  triggerFraction: z.number().nullable(),
  projectedCostPerMetric: z.number().nullable(),
  projectedMonthlyMetric: z.number().int().nullable(),
  projectedMonthlyAdSpend: z.number().int().nullable(),
  projectedMonthlyMaintenanceSpend: z.number().int().nullable(),
  projectedMonthlyTotalSpend: z.number().int().nullable(),
  projectedMonthlyRevenue: z.number().int().nullable(),
  projectedMonthlyNet: z.number().int().nullable(),
})

export interface CampaignUpdateRecordRelations {
  campaign: z.infer<typeof campaignBaseSchema> & CampaignRelations
}

export const campaignUpdateRecordRelationsSchema: z.ZodObject<{
  [K in keyof CampaignUpdateRecordRelations]: z.ZodType<CampaignUpdateRecordRelations[K]>
}> = z.object({
  campaign: z.lazy(() => campaignBaseSchema.merge(campaignRelationsSchema)),
})

export const campaignUpdateRecordSchema = campaignUpdateRecordBaseSchema
  .merge(campaignUpdateRecordRelationsSchema)

export const campaignUpdateRecordCreateSchema = campaignUpdateRecordBaseSchema
  .extend({
    stage: campaignUpdateRecordBaseSchema.shape.stage.unwrap(),
    dailyBudget: campaignUpdateRecordBaseSchema.shape.dailyBudget.unwrap(),
    triggerFraction: campaignUpdateRecordBaseSchema.shape.triggerFraction.unwrap(),
    projectedCostPerMetric: campaignUpdateRecordBaseSchema.shape.projectedCostPerMetric.unwrap(),
    projectedMonthlyMetric: campaignUpdateRecordBaseSchema.shape.projectedMonthlyMetric.unwrap(),
    projectedMonthlyAdSpend: campaignUpdateRecordBaseSchema.shape.projectedMonthlyAdSpend.unwrap(),
    projectedMonthlyMaintenanceSpend: campaignUpdateRecordBaseSchema.shape.projectedMonthlyMaintenanceSpend.unwrap(),
    projectedMonthlyTotalSpend: campaignUpdateRecordBaseSchema.shape.projectedMonthlyTotalSpend.unwrap(),
    projectedMonthlyRevenue: campaignUpdateRecordBaseSchema.shape.projectedMonthlyRevenue.unwrap(),
    projectedMonthlyNet: campaignUpdateRecordBaseSchema.shape.projectedMonthlyNet.unwrap(),
  }).partial({
    id: true,
    createdAt: true,
    campaignId: true,
    stage: true,
    dailyBudget: true,
    triggerFraction: true,
    projectedCostPerMetric: true,
    projectedMonthlyMetric: true,
    projectedMonthlyAdSpend: true,
    projectedMonthlyMaintenanceSpend: true,
    projectedMonthlyTotalSpend: true,
    projectedMonthlyRevenue: true,
    projectedMonthlyNet: true,
  })

export const campaignUpdateRecordUpdateSchema = campaignUpdateRecordBaseSchema
  .extend({
    stage: campaignUpdateRecordBaseSchema.shape.stage.unwrap(),
    dailyBudget: campaignUpdateRecordBaseSchema.shape.dailyBudget.unwrap(),
    triggerFraction: campaignUpdateRecordBaseSchema.shape.triggerFraction.unwrap(),
    projectedCostPerMetric: campaignUpdateRecordBaseSchema.shape.projectedCostPerMetric.unwrap(),
    projectedMonthlyMetric: campaignUpdateRecordBaseSchema.shape.projectedMonthlyMetric.unwrap(),
    projectedMonthlyAdSpend: campaignUpdateRecordBaseSchema.shape.projectedMonthlyAdSpend.unwrap(),
    projectedMonthlyMaintenanceSpend: campaignUpdateRecordBaseSchema.shape.projectedMonthlyMaintenanceSpend.unwrap(),
    projectedMonthlyTotalSpend: campaignUpdateRecordBaseSchema.shape.projectedMonthlyTotalSpend.unwrap(),
    projectedMonthlyRevenue: campaignUpdateRecordBaseSchema.shape.projectedMonthlyRevenue.unwrap(),
    projectedMonthlyNet: campaignUpdateRecordBaseSchema.shape.projectedMonthlyNet.unwrap(),
  })
  .partial()
  
