import * as z from "zod"
import { campaignStageSchema } from "./campaignstage"
import { UserRelations, userRelationsSchema, userBaseSchema } from "./user"
import { CampaignRelations, campaignRelationsSchema, campaignBaseSchema } from "./campaign"

export const campaignUpdateBaseSchema = z.object({
  id: z.string(),
  createdAt: z.date(),
  createdById: z.string(),
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

export interface CampaignUpdateRelations {
  createdBy: z.infer<typeof userBaseSchema> & UserRelations
  campaign: z.infer<typeof campaignBaseSchema> & CampaignRelations
}

export const campaignUpdateRelationsSchema: z.ZodObject<{
  [K in keyof CampaignUpdateRelations]: z.ZodType<CampaignUpdateRelations[K]>
}> = z.object({
  createdBy: z.lazy(() => userBaseSchema.merge(userRelationsSchema)),
  campaign: z.lazy(() => campaignBaseSchema.merge(campaignRelationsSchema)),
})

export const campaignUpdateSchema = campaignUpdateBaseSchema
  .merge(campaignUpdateRelationsSchema)

export const campaignUpdateCreateSchema = campaignUpdateBaseSchema
  .extend({
    stage: campaignUpdateBaseSchema.shape.stage.unwrap(),
    dailyBudget: campaignUpdateBaseSchema.shape.dailyBudget.unwrap(),
    triggerFraction: campaignUpdateBaseSchema.shape.triggerFraction.unwrap(),
    projectedCostPerMetric: campaignUpdateBaseSchema.shape.projectedCostPerMetric.unwrap(),
    projectedMonthlyMetric: campaignUpdateBaseSchema.shape.projectedMonthlyMetric.unwrap(),
    projectedMonthlyAdSpend: campaignUpdateBaseSchema.shape.projectedMonthlyAdSpend.unwrap(),
    projectedMonthlyMaintenanceSpend: campaignUpdateBaseSchema.shape.projectedMonthlyMaintenanceSpend.unwrap(),
    projectedMonthlyTotalSpend: campaignUpdateBaseSchema.shape.projectedMonthlyTotalSpend.unwrap(),
    projectedMonthlyRevenue: campaignUpdateBaseSchema.shape.projectedMonthlyRevenue.unwrap(),
    projectedMonthlyNet: campaignUpdateBaseSchema.shape.projectedMonthlyNet.unwrap(),
  }).partial({
    id: true,
    createdAt: true,
    createdById: true,
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

export const campaignUpdateUpdateSchema = campaignUpdateBaseSchema
  .extend({
    stage: campaignUpdateBaseSchema.shape.stage.unwrap(),
    dailyBudget: campaignUpdateBaseSchema.shape.dailyBudget.unwrap(),
    triggerFraction: campaignUpdateBaseSchema.shape.triggerFraction.unwrap(),
    projectedCostPerMetric: campaignUpdateBaseSchema.shape.projectedCostPerMetric.unwrap(),
    projectedMonthlyMetric: campaignUpdateBaseSchema.shape.projectedMonthlyMetric.unwrap(),
    projectedMonthlyAdSpend: campaignUpdateBaseSchema.shape.projectedMonthlyAdSpend.unwrap(),
    projectedMonthlyMaintenanceSpend: campaignUpdateBaseSchema.shape.projectedMonthlyMaintenanceSpend.unwrap(),
    projectedMonthlyTotalSpend: campaignUpdateBaseSchema.shape.projectedMonthlyTotalSpend.unwrap(),
    projectedMonthlyRevenue: campaignUpdateBaseSchema.shape.projectedMonthlyRevenue.unwrap(),
    projectedMonthlyNet: campaignUpdateBaseSchema.shape.projectedMonthlyNet.unwrap(),
  })
  .partial()
  
