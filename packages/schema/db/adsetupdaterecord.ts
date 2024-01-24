import * as z from "zod"
import { adStatusSchema } from "./adstatus"
import { AdSetRelations, adSetRelationsSchema, adSetBaseSchema } from "./adset"
import { AudienceRelations, audienceRelationsSchema, audienceBaseSchema } from "./audience"

export const adSetUpdateRecordBaseSchema = z.object({
  id: z.string(),
  createdAt: z.date(),
  adSetId: z.string(),
  metaComplete: z.boolean().nullable(),
  tiktokComplete: z.boolean().nullable(),
  status: adStatusSchema,
  dailyBudget: z.number().nullable(),
  audienceId: z.string().nullable(),
})

export interface AdSetUpdateRecordRelations {
  adSet: z.infer<typeof adSetBaseSchema> & AdSetRelations
  audience: (z.infer<typeof audienceBaseSchema> & AudienceRelations) | null
}

export const adSetUpdateRecordRelationsSchema: z.ZodObject<{
  [K in keyof AdSetUpdateRecordRelations]: z.ZodType<AdSetUpdateRecordRelations[K]>
}> = z.object({
  adSet: z.lazy(() => adSetBaseSchema.merge(adSetRelationsSchema)),
  audience: z.lazy(() => audienceBaseSchema.merge(audienceRelationsSchema)).nullable(),
})

export const adSetUpdateRecordSchema = adSetUpdateRecordBaseSchema
  .merge(adSetUpdateRecordRelationsSchema)

export const adSetUpdateRecordCreateSchema = adSetUpdateRecordBaseSchema
  .extend({
    metaComplete: adSetUpdateRecordBaseSchema.shape.metaComplete.unwrap(),
    tiktokComplete: adSetUpdateRecordBaseSchema.shape.tiktokComplete.unwrap(),
    dailyBudget: adSetUpdateRecordBaseSchema.shape.dailyBudget.unwrap(),
    audienceId: adSetUpdateRecordBaseSchema.shape.audienceId.unwrap(),
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

export const adSetUpdateRecordUpdateSchema = adSetUpdateRecordBaseSchema
  .extend({
    metaComplete: adSetUpdateRecordBaseSchema.shape.metaComplete.unwrap(),
    tiktokComplete: adSetUpdateRecordBaseSchema.shape.tiktokComplete.unwrap(),
    dailyBudget: adSetUpdateRecordBaseSchema.shape.dailyBudget.unwrap(),
    audienceId: adSetUpdateRecordBaseSchema.shape.audienceId.unwrap(),
  })
  .partial()
  
