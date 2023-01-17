import * as z from "zod"
import { AdCreativeRelations, adCreativeRelationsSchema, adCreativeBaseSchema } from "./adcreative"
import { AdCampaignRelations, adCampaignRelationsSchema, adCampaignBaseSchema } from "./adcampaign"

export const headlineBaseSchema = z.object({
  id: z.string(),
  createdAt: z.date(),
  headline: z.string(),
})

export interface HeadlineRelations {
  adCreatives: (z.infer<typeof adCreativeBaseSchema> & AdCreativeRelations)[]
  adCampaignTests: (z.infer<typeof adCampaignBaseSchema> & AdCampaignRelations)[]
}

export const headlineRelationsSchema: z.ZodObject<{
  [K in keyof HeadlineRelations]: z.ZodType<HeadlineRelations[K]>
}> = z.object({
  adCreatives: z.lazy(() => adCreativeBaseSchema.merge(adCreativeRelationsSchema)).array(),
  adCampaignTests: z.lazy(() => adCampaignBaseSchema.merge(adCampaignRelationsSchema)).array(),
})

export const headlineSchema = headlineBaseSchema
  .merge(headlineRelationsSchema)

export const headlineCreateSchema = headlineBaseSchema.partial({
  id: true,
  createdAt: true,
  adCreatives: true,
  adCampaignTests: true,
})

export const headlineUpdateSchema = headlineBaseSchema
  .partial()
  
