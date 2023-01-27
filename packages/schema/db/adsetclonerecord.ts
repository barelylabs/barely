import * as z from "zod"
import { adStatusSchema } from "./adstatus"
import { AdSetRelations, adSetRelationsSchema, adSetBaseSchema } from "./adset"
import { AudienceRelations, audienceRelationsSchema, audienceBaseSchema } from "./audience"

export const adSetCloneRecordBaseSchema = z.object({
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
  childAdSetId: z.string().nullable(),
})

export interface AdSetCloneRecordRelations {
  parentAdSet: z.infer<typeof adSetBaseSchema> & AdSetRelations
  audience: (z.infer<typeof audienceBaseSchema> & AudienceRelations) | null
  childAdSet: (z.infer<typeof adSetBaseSchema> & AdSetRelations) | null
}

export const adSetCloneRecordRelationsSchema: z.ZodObject<{
  [K in keyof AdSetCloneRecordRelations]: z.ZodType<AdSetCloneRecordRelations[K]>
}> = z.object({
  parentAdSet: z.lazy(() => adSetBaseSchema.merge(adSetRelationsSchema)),
  audience: z.lazy(() => audienceBaseSchema.merge(audienceRelationsSchema)).nullable(),
  childAdSet: z.lazy(() => adSetBaseSchema.merge(adSetRelationsSchema)).nullable(),
})

export const adSetCloneRecordSchema = adSetCloneRecordBaseSchema
  .merge(adSetCloneRecordRelationsSchema)

export const adSetCloneRecordCreateSchema = adSetCloneRecordBaseSchema
  .extend({
    dailyBudget: adSetCloneRecordBaseSchema.shape.dailyBudget.unwrap(),
    audienceId: adSetCloneRecordBaseSchema.shape.audienceId.unwrap(),
    childAdSetId: adSetCloneRecordBaseSchema.shape.childAdSetId.unwrap(),
  }).partial({
    id: true,
    createdAt: true,
    parentAdSetId: true,
    dailyBudget: true,
    audience: true,
    audienceId: true,
    childAdSet: true,
    childAdSetId: true,
  })

export const adSetCloneRecordUpdateSchema = adSetCloneRecordBaseSchema
  .extend({
    dailyBudget: adSetCloneRecordBaseSchema.shape.dailyBudget.unwrap(),
    audienceId: adSetCloneRecordBaseSchema.shape.audienceId.unwrap(),
    childAdSetId: adSetCloneRecordBaseSchema.shape.childAdSetId.unwrap(),
  })
  .partial()
  
