import * as z from "zod"
import { subscriptionTypeSchema } from "./subscriptiontype"
import { LineItemRelations, lineItemRelationsSchema, lineItemBaseSchema } from "./lineitem"

export const subscriptionBaseSchema = z.object({
  id: z.string(),
  type: subscriptionTypeSchema,
})

export interface SubscriptionRelations {
  lineItems: (z.infer<typeof lineItemBaseSchema> & LineItemRelations)[]
}

export const subscriptionRelationsSchema: z.ZodObject<{
  [K in keyof SubscriptionRelations]: z.ZodType<SubscriptionRelations[K]>
}> = z.object({
  lineItems: z.lazy(() => lineItemBaseSchema.merge(lineItemRelationsSchema)).array(),
})

export const subscriptionSchema = subscriptionBaseSchema
  .merge(subscriptionRelationsSchema)

export const subscriptionCreateSchema = subscriptionBaseSchema.partial({
  id: true,
  lineItems: true,
})

export const subscriptionUpdateSchema = subscriptionBaseSchema
  .partial()
  
