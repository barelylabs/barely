import * as z from "zod"
import { paymentTypeSchema } from "./paymenttype"
import { CampaignRelations, campaignRelationsSchema, campaignBaseSchema } from "./campaign"
import { SubscriptionRelations, subscriptionRelationsSchema, subscriptionBaseSchema } from "./subscription"
import { TransactionRelations, transactionRelationsSchema, transactionBaseSchema } from "./transaction"

export const lineItemBaseSchema = z.object({
  id: z.string(),
  name: z.string(),
  campaignId: z.string().nullable(),
  subscriptionId: z.string().nullable(),
  paymentType: paymentTypeSchema,
  setupPrice: z.number().nullable(),
  subscriptionPrice: z.number().nullable(),
  subscriptionPriceDescription: z.string().nullable(),
  maintenancePrice: z.string().nullable(),
  maintenancePriceDescription: z.string().nullable(),
  totalDue: z.number().nullable(),
  transactionId: z.string().nullable(),
})

export interface LineItemRelations {
  campaign: (z.infer<typeof campaignBaseSchema> & CampaignRelations) | null
  subscription: (z.infer<typeof subscriptionBaseSchema> & SubscriptionRelations) | null
  transaction: (z.infer<typeof transactionBaseSchema> & TransactionRelations) | null
}

export const lineItemRelationsSchema: z.ZodObject<{
  [K in keyof LineItemRelations]: z.ZodType<LineItemRelations[K]>
}> = z.object({
  campaign: z.lazy(() => campaignBaseSchema.merge(campaignRelationsSchema)).nullable(),
  subscription: z.lazy(() => subscriptionBaseSchema.merge(subscriptionRelationsSchema)).nullable(),
  transaction: z.lazy(() => transactionBaseSchema.merge(transactionRelationsSchema)).nullable(),
})

export const lineItemSchema = lineItemBaseSchema
  .merge(lineItemRelationsSchema)

export const lineItemCreateSchema = lineItemBaseSchema
  .extend({
    campaignId: lineItemBaseSchema.shape.campaignId.unwrap(),
    subscriptionId: lineItemBaseSchema.shape.subscriptionId.unwrap(),
    setupPrice: lineItemBaseSchema.shape.setupPrice.unwrap(),
    subscriptionPrice: lineItemBaseSchema.shape.subscriptionPrice.unwrap(),
    subscriptionPriceDescription: lineItemBaseSchema.shape.subscriptionPriceDescription.unwrap(),
    maintenancePrice: lineItemBaseSchema.shape.maintenancePrice.unwrap(),
    maintenancePriceDescription: lineItemBaseSchema.shape.maintenancePriceDescription.unwrap(),
    totalDue: lineItemBaseSchema.shape.totalDue.unwrap(),
    transactionId: lineItemBaseSchema.shape.transactionId.unwrap(),
  }).partial({
    id: true,
    campaign: true,
    campaignId: true,
    subscription: true,
    subscriptionId: true,
    setupPrice: true,
    subscriptionPrice: true,
    subscriptionPriceDescription: true,
    maintenancePrice: true,
    maintenancePriceDescription: true,
    totalDue: true,
    transaction: true,
    transactionId: true,
  })

export const lineItemUpdateSchema = lineItemBaseSchema
  .extend({
    campaignId: lineItemBaseSchema.shape.campaignId.unwrap(),
    subscriptionId: lineItemBaseSchema.shape.subscriptionId.unwrap(),
    setupPrice: lineItemBaseSchema.shape.setupPrice.unwrap(),
    subscriptionPrice: lineItemBaseSchema.shape.subscriptionPrice.unwrap(),
    subscriptionPriceDescription: lineItemBaseSchema.shape.subscriptionPriceDescription.unwrap(),
    maintenancePrice: lineItemBaseSchema.shape.maintenancePrice.unwrap(),
    maintenancePriceDescription: lineItemBaseSchema.shape.maintenancePriceDescription.unwrap(),
    totalDue: lineItemBaseSchema.shape.totalDue.unwrap(),
    transactionId: lineItemBaseSchema.shape.transactionId.unwrap(),
  })
  .partial()
  
