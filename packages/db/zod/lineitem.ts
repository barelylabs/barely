import * as z from "zod"
import { paymentTypeSchema } from "./paymenttype"
import { CampaignRelations, campaignRelationsSchema, campaignBaseSchema } from "./campaign"
import { TransactionRelations, transactionRelationsSchema, transactionBaseSchema } from "./transaction"

export const lineItemBaseSchema = z.object({
  id: z.string(),
  createdAt: z.date(),
  name: z.string(),
  campaignId: z.string(),
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
  campaign: z.infer<typeof campaignBaseSchema> & CampaignRelations
  transactions: (z.infer<typeof transactionBaseSchema> & TransactionRelations) | null
}

export const lineItemRelationsSchema: z.ZodObject<{
  [K in keyof LineItemRelations]: z.ZodType<LineItemRelations[K]>
}> = z.object({
  campaign: z.lazy(() => campaignBaseSchema.merge(campaignRelationsSchema)),
  transactions: z.lazy(() => transactionBaseSchema.merge(transactionRelationsSchema)).nullable(),
})

export const lineItemSchema = lineItemBaseSchema
  .merge(lineItemRelationsSchema)

export const lineItemCreateSchema = lineItemBaseSchema
  .extend({
    setupPrice: lineItemBaseSchema.shape.setupPrice.unwrap(),
    subscriptionPrice: lineItemBaseSchema.shape.subscriptionPrice.unwrap(),
    subscriptionPriceDescription: lineItemBaseSchema.shape.subscriptionPriceDescription.unwrap(),
    maintenancePrice: lineItemBaseSchema.shape.maintenancePrice.unwrap(),
    maintenancePriceDescription: lineItemBaseSchema.shape.maintenancePriceDescription.unwrap(),
    totalDue: lineItemBaseSchema.shape.totalDue.unwrap(),
    transactionId: lineItemBaseSchema.shape.transactionId.unwrap(),
  }).partial({
    id: true,
    createdAt: true,
    campaignId: true,
    setupPrice: true,
    subscriptionPrice: true,
    subscriptionPriceDescription: true,
    maintenancePrice: true,
    maintenancePriceDescription: true,
    totalDue: true,
    transactions: true,
    transactionId: true,
  })

export const lineItemUpdateSchema = lineItemBaseSchema
  .extend({
    setupPrice: lineItemBaseSchema.shape.setupPrice.unwrap(),
    subscriptionPrice: lineItemBaseSchema.shape.subscriptionPrice.unwrap(),
    subscriptionPriceDescription: lineItemBaseSchema.shape.subscriptionPriceDescription.unwrap(),
    maintenancePrice: lineItemBaseSchema.shape.maintenancePrice.unwrap(),
    maintenancePriceDescription: lineItemBaseSchema.shape.maintenancePriceDescription.unwrap(),
    totalDue: lineItemBaseSchema.shape.totalDue.unwrap(),
    transactionId: lineItemBaseSchema.shape.transactionId.unwrap(),
  })
  .partial()
  
