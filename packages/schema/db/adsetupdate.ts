import * as z from "zod"
import { adStatusSchema } from "./adstatus"
import { AdSetRelations, adSetRelationsSchema, adSetBaseSchema } from "./adset"
import { AudienceRelations, audienceRelationsSchema, audienceBaseSchema } from "./audience"

export const adSetUpdateBaseSchema = z.object({
  id: z.string(),
  createdAt: z.date(),
  adSetId: z.string(),
  metaComplete: z.boolean().nullable(),
  tiktokComplete: z.boolean().nullable(),
  status: adStatusSchema,
  dailyBudget: z.number().nullable(),
  audienceId: z.string().nullable(),
})

export interface AdSetUpdateRelations {
  adSet: z.infer<typeof adSetBaseSchema> & AdSetRelations
  audience: (z.infer<typeof audienceBaseSchema> & AudienceRelations) | null
}

export const adSetUpdateRelationsSchema: z.ZodObject<{
  [K in keyof AdSetUpdateRelations]: z.ZodType<AdSetUpdateRelations[K]>
}> = z.object({
  adSet: z.lazy(() => adSetBaseSchema.merge(adSetRelationsSchema)),
  audience: z.lazy(() => audienceBaseSchema.merge(audienceRelationsSchema)).nullable(),
})

export const adSetUpdateSchema = adSetUpdateBaseSchema
  .merge(adSetUpdateRelationsSchema)

export const adSetUpdateCreateSchema = adSetUpdateBaseSchema
  .extend({
    metaComplete: adSetUpdateBaseSchema.shape.metaComplete.unwrap(),
    tiktokComplete: adSetUpdateBaseSchema.shape.tiktokComplete.unwrap(),
    dailyBudget: adSetUpdateBaseSchema.shape.dailyBudget.unwrap(),
    audienceId: adSetUpdateBaseSchema.shape.audienceId.unwrap(),
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

export const adSetUpdateUpdateSchema = adSetUpdateBaseSchema
  .extend({
    metaComplete: adSetUpdateBaseSchema.shape.metaComplete.unwrap(),
    tiktokComplete: adSetUpdateBaseSchema.shape.tiktokComplete.unwrap(),
    dailyBudget: adSetUpdateBaseSchema.shape.dailyBudget.unwrap(),
    audienceId: adSetUpdateBaseSchema.shape.audienceId.unwrap(),
  })
  .partial()
  
