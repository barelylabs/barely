import * as z from "zod"
import { adStatusSchema } from "./adstatus"
import { AdSetRelations, adSetRelationsSchema, adSetBaseSchema } from "./adset"
import { AudienceRelations, audienceRelationsSchema, audienceBaseSchema } from "./audience"

export const adSetCloneBaseSchema = z.object({
  id: z.string(),
  createdAt: z.date(),
  parentAdSetId: z.string(),
  meta: z.boolean(),
  metaComplete: z.boolean(),
  tiktok: z.boolean(),
  tiktokComplete: z.boolean(),
  status: adStatusSchema,
  dailyBudget: z.number().nullable(),
  audienceId: z.string().nullable(),
  clonedAdSetId: z.string().nullable(),
})

export interface AdSetCloneRelations {
  parentAdSet: z.infer<typeof adSetBaseSchema> & AdSetRelations
  audience: (z.infer<typeof audienceBaseSchema> & AudienceRelations) | null
  clonedAdSet: (z.infer<typeof adSetBaseSchema> & AdSetRelations) | null
}

export const adSetCloneRelationsSchema: z.ZodObject<{
  [K in keyof AdSetCloneRelations]: z.ZodType<AdSetCloneRelations[K]>
}> = z.object({
  parentAdSet: z.lazy(() => adSetBaseSchema.merge(adSetRelationsSchema)),
  audience: z.lazy(() => audienceBaseSchema.merge(audienceRelationsSchema)).nullable(),
  clonedAdSet: z.lazy(() => adSetBaseSchema.merge(adSetRelationsSchema)).nullable(),
})

export const adSetCloneSchema = adSetCloneBaseSchema
  .merge(adSetCloneRelationsSchema)

export const adSetCloneCreateSchema = adSetCloneBaseSchema
  .extend({
    dailyBudget: adSetCloneBaseSchema.shape.dailyBudget.unwrap(),
    audienceId: adSetCloneBaseSchema.shape.audienceId.unwrap(),
    clonedAdSetId: adSetCloneBaseSchema.shape.clonedAdSetId.unwrap(),
  }).partial({
    id: true,
    createdAt: true,
    parentAdSetId: true,
    dailyBudget: true,
    audience: true,
    audienceId: true,
    clonedAdSet: true,
    clonedAdSetId: true,
  })

export const adSetCloneUpdateSchema = adSetCloneBaseSchema
  .extend({
    dailyBudget: adSetCloneBaseSchema.shape.dailyBudget.unwrap(),
    audienceId: adSetCloneBaseSchema.shape.audienceId.unwrap(),
    clonedAdSetId: adSetCloneBaseSchema.shape.clonedAdSetId.unwrap(),
  })
  .partial()
  
