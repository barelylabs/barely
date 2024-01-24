import * as z from "zod"
import { adStatusSchema } from "./adstatus"
import { AdSetRelations, adSetRelationsSchema, adSetBaseSchema } from "./adset"
import { AdCreativeRelations, adCreativeRelationsSchema, adCreativeBaseSchema } from "./adcreative"
import { StatRelations, statRelationsSchema, statBaseSchema } from "./stat"

export const adBaseSchema = z.object({
  id: z.string(),
  createdAt: z.date(),
  adSetId: z.string(),
  metaId: z.string().nullable(),
  tikTokId: z.string().nullable(),
  creativeId: z.string(),
  status: adStatusSchema,
  passedTest: z.boolean().nullable(),
})

export interface AdRelations {
  adSet: z.infer<typeof adSetBaseSchema> & AdSetRelations
  creative: z.infer<typeof adCreativeBaseSchema> & AdCreativeRelations
  stats: (z.infer<typeof statBaseSchema> & StatRelations)[]
}

export const adRelationsSchema: z.ZodObject<{
  [K in keyof AdRelations]: z.ZodType<AdRelations[K]>
}> = z.object({
  adSet: z.lazy(() => adSetBaseSchema.merge(adSetRelationsSchema)),
  creative: z.lazy(() => adCreativeBaseSchema.merge(adCreativeRelationsSchema)),
  stats: z.lazy(() => statBaseSchema.merge(statRelationsSchema)).array(),
})

export const adSchema = adBaseSchema
  .merge(adRelationsSchema)

export const adCreateSchema = adBaseSchema
  .extend({
    metaId: adBaseSchema.shape.metaId.unwrap(),
    tikTokId: adBaseSchema.shape.tikTokId.unwrap(),
    passedTest: adBaseSchema.shape.passedTest.unwrap(),
  }).partial({
    id: true,
    createdAt: true,
    adSetId: true,
    metaId: true,
    tikTokId: true,
    creativeId: true,
    passedTest: true,
    stats: true,
  })

export const adUpdateSchema = adBaseSchema
  .extend({
    metaId: adBaseSchema.shape.metaId.unwrap(),
    tikTokId: adBaseSchema.shape.tikTokId.unwrap(),
    passedTest: adBaseSchema.shape.passedTest.unwrap(),
  })
  .partial()
  
