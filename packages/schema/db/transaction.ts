import * as z from "zod"
import { transactionStatusSchema } from "./transactionstatus"
import { LineItemRelations, lineItemRelationsSchema, lineItemBaseSchema } from "./lineitem"
import { UserRelations, userRelationsSchema, userBaseSchema } from "./user"

// Helper schema for JSON fields
type Literal = boolean | number | string
type Json = Literal | { [key: string]: Json } | Json[]
const literalSchema = z.union([z.string(), z.number(), z.boolean()])
const jsonSchema: z.ZodSchema<Json> = z.lazy(() =>
  z.union([literalSchema, z.array(jsonSchema), z.record(jsonSchema)]),
)

export const transactionBaseSchema = z.object({
  id: z.string(),
  createdAt: z.date(),
  completedAt: z.date().nullable(),
  type: z.string(),
  amount: z.number(),
  description: z.string().nullable(),
  status: transactionStatusSchema,
  stripeId: z.string().nullable(),
  stripeClientSecret: z.string().nullable(),
  stripeMetadata: jsonSchema.nullable(),
  stripeLiveMode: z.boolean(),
  checkoutLink: z.string().nullable(),
  userId: z.string().nullable(),
})

export interface TransactionRelations {
  lineItems: (z.infer<typeof lineItemBaseSchema> & LineItemRelations)[]
  user: (z.infer<typeof userBaseSchema> & UserRelations) | null
}

export const transactionRelationsSchema: z.ZodObject<{
  [K in keyof TransactionRelations]: z.ZodType<TransactionRelations[K]>
}> = z.object({
  lineItems: z.lazy(() => lineItemBaseSchema.merge(lineItemRelationsSchema)).array(),
  user: z.lazy(() => userBaseSchema.merge(userRelationsSchema)).nullable(),
})

export const transactionSchema = transactionBaseSchema
  .merge(transactionRelationsSchema)

export const transactionCreateSchema = transactionBaseSchema
  .extend({
    completedAt: transactionBaseSchema.shape.completedAt.unwrap(),
    description: transactionBaseSchema.shape.description.unwrap(),
    stripeId: transactionBaseSchema.shape.stripeId.unwrap(),
    stripeClientSecret: transactionBaseSchema.shape.stripeClientSecret.unwrap(),
    stripeMetadata: transactionBaseSchema.shape.stripeMetadata.unwrap(),
    checkoutLink: transactionBaseSchema.shape.checkoutLink.unwrap(),
    userId: transactionBaseSchema.shape.userId.unwrap(),
  }).partial({
    id: true,
    createdAt: true,
    completedAt: true,
    description: true,
    lineItems: true,
    stripeId: true,
    stripeClientSecret: true,
    stripeMetadata: true,
    stripeLiveMode: true,
    checkoutLink: true,
    user: true,
    userId: true,
  })

export const transactionUpdateSchema = transactionBaseSchema
  .extend({
    completedAt: transactionBaseSchema.shape.completedAt.unwrap(),
    description: transactionBaseSchema.shape.description.unwrap(),
    stripeId: transactionBaseSchema.shape.stripeId.unwrap(),
    stripeClientSecret: transactionBaseSchema.shape.stripeClientSecret.unwrap(),
    stripeMetadata: transactionBaseSchema.shape.stripeMetadata.unwrap(),
    checkoutLink: transactionBaseSchema.shape.checkoutLink.unwrap(),
    userId: transactionBaseSchema.shape.userId.unwrap(),
  })
  .partial()
  
