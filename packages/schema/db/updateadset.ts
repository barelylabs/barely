import * as z from "zod"
import { adStatusSchema } from "./adstatus"
import { AdSetRelations, adSetRelationsSchema, adSetBaseSchema } from "./adset"
import { AudienceRelations, audienceRelationsSchema, audienceBaseSchema } from "./audience"

export const updateAdSetBaseSchema = z.object({
  id: z.string(),
  createdAt: z.date(),
  adSetId: z.string(),
  metaComplete: z.boolean().nullable(),
  tiktokComplete: z.boolean().nullable(),
  dailyBudget: z.number().nullable(),
  audienceId: z.string().nullable(),
  status: adStatusSchema,
})

export interface UpdateAdSetRelations {
  adSet: z.infer<typeof adSetBaseSchema> & AdSetRelations
  audience: (z.infer<typeof audienceBaseSchema> & AudienceRelations) | null
}

export const updateAdSetRelationsSchema: z.ZodObject<{
  [K in keyof UpdateAdSetRelations]: z.ZodType<UpdateAdSetRelations[K]>
}> = z.object({
  adSet: z.lazy(() => adSetBaseSchema.merge(adSetRelationsSchema)),
  audience: z.lazy(() => audienceBaseSchema.merge(audienceRelationsSchema)).nullable(),
})

export const updateAdSetSchema = updateAdSetBaseSchema
  .merge(updateAdSetRelationsSchema)

export const updateAdSetCreateSchema = updateAdSetBaseSchema
  .extend({
    metaComplete: updateAdSetBaseSchema.shape.metaComplete.unwrap(),
    tiktokComplete: updateAdSetBaseSchema.shape.tiktokComplete.unwrap(),
    dailyBudget: updateAdSetBaseSchema.shape.dailyBudget.unwrap(),
    audienceId: updateAdSetBaseSchema.shape.audienceId.unwrap(),
  }).partial({
    id: true,
    createdAt: true,
    adSetId: true,
    metaComplete: true,
    tiktokComplete: true,
    dailyBudget: true,
    audience: true,
    audienceId: true,
  })

export const updateAdSetUpdateSchema = updateAdSetBaseSchema
  .extend({
    metaComplete: updateAdSetBaseSchema.shape.metaComplete.unwrap(),
    tiktokComplete: updateAdSetBaseSchema.shape.tiktokComplete.unwrap(),
    dailyBudget: updateAdSetBaseSchema.shape.dailyBudget.unwrap(),
    audienceId: updateAdSetBaseSchema.shape.audienceId.unwrap(),
  })
  .partial()
  
