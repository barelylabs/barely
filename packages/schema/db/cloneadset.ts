import * as z from "zod"
import { adStatusSchema } from "./adstatus"
import { AdSetRelations, adSetRelationsSchema, adSetBaseSchema } from "./adset"
import { AudienceRelations, audienceRelationsSchema, audienceBaseSchema } from "./audience"

export const cloneAdSetBaseSchema = z.object({
  id: z.string(),
  createdAt: z.date(),
  parentAdSetId: z.string(),
  meta: z.boolean(),
  metaComplete: z.boolean(),
  tiktok: z.boolean(),
  tiktokComplete: z.boolean(),
  dailyBudget: z.number().nullable(),
  audienceId: z.string().nullable(),
  status: adStatusSchema,
  clonedAdSetId: z.string().nullable(),
})

export interface CloneAdSetRelations {
  parentAdSet: z.infer<typeof adSetBaseSchema> & AdSetRelations
  audience: (z.infer<typeof audienceBaseSchema> & AudienceRelations) | null
  clonedAdSet: (z.infer<typeof adSetBaseSchema> & AdSetRelations) | null
}

export const cloneAdSetRelationsSchema: z.ZodObject<{
  [K in keyof CloneAdSetRelations]: z.ZodType<CloneAdSetRelations[K]>
}> = z.object({
  parentAdSet: z.lazy(() => adSetBaseSchema.merge(adSetRelationsSchema)),
  audience: z.lazy(() => audienceBaseSchema.merge(audienceRelationsSchema)).nullable(),
  clonedAdSet: z.lazy(() => adSetBaseSchema.merge(adSetRelationsSchema)).nullable(),
})

export const cloneAdSetSchema = cloneAdSetBaseSchema
  .merge(cloneAdSetRelationsSchema)

export const cloneAdSetCreateSchema = cloneAdSetBaseSchema
  .extend({
    dailyBudget: cloneAdSetBaseSchema.shape.dailyBudget.unwrap(),
    audienceId: cloneAdSetBaseSchema.shape.audienceId.unwrap(),
    clonedAdSetId: cloneAdSetBaseSchema.shape.clonedAdSetId.unwrap(),
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

export const cloneAdSetUpdateSchema = cloneAdSetBaseSchema
  .extend({
    dailyBudget: cloneAdSetBaseSchema.shape.dailyBudget.unwrap(),
    audienceId: cloneAdSetBaseSchema.shape.audienceId.unwrap(),
    clonedAdSetId: cloneAdSetBaseSchema.shape.clonedAdSetId.unwrap(),
  })
  .partial()
  
