import * as z from "zod"
import { genderSchema } from "./gender"
import { AudienceRelations, audienceRelationsSchema, audienceBaseSchema } from "./audience"
import { AdCampaignRelations, adCampaignRelationsSchema, adCampaignBaseSchema } from "./adcampaign"

export const demoBaseSchema = z.object({
  id: z.string(),
  name: z.string(),
  ageMin: z.number().int(),
  ageMax: z.number().int(),
  gender: genderSchema,
  onlyEnglish: z.boolean(),
})

export interface DemoRelations {
  audiences: (z.infer<typeof audienceBaseSchema> & AudienceRelations)[]
  adCampaigns: (z.infer<typeof adCampaignBaseSchema> & AdCampaignRelations)[]
}

export const demoRelationsSchema: z.ZodObject<{
  [K in keyof DemoRelations]: z.ZodType<DemoRelations[K]>
}> = z.object({
  audiences: z.lazy(() => audienceBaseSchema.merge(audienceRelationsSchema)).array(),
  adCampaigns: z.lazy(() => adCampaignBaseSchema.merge(adCampaignRelationsSchema)).array(),
})

export const demoSchema = demoBaseSchema
  .merge(demoRelationsSchema)

export const demoCreateSchema = demoBaseSchema.partial({
  id: true,
  ageMin: true,
  audiences: true,
  adCampaigns: true,
})

export const demoUpdateSchema = demoBaseSchema
  .partial()
  
