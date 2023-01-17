import * as z from "zod"
import { CountryRelations, countryRelationsSchema, countryBaseSchema } from "./country"
import { AudienceRelations, audienceRelationsSchema, audienceBaseSchema } from "./audience"
import { AdCampaignRelations, adCampaignRelationsSchema, adCampaignBaseSchema } from "./adcampaign"

export const geoGroupBaseSchema = z.object({
  id: z.string(),
  name: z.string(),
})

export interface GeoGroupRelations {
  countries: (z.infer<typeof countryBaseSchema> & CountryRelations)[]
  audiences: (z.infer<typeof audienceBaseSchema> & AudienceRelations)[]
  adCampaignTests: (z.infer<typeof adCampaignBaseSchema> & AdCampaignRelations)[]
}

export const geoGroupRelationsSchema: z.ZodObject<{
  [K in keyof GeoGroupRelations]: z.ZodType<GeoGroupRelations[K]>
}> = z.object({
  countries: z.lazy(() => countryBaseSchema.merge(countryRelationsSchema)).array(),
  audiences: z.lazy(() => audienceBaseSchema.merge(audienceRelationsSchema)).array(),
  adCampaignTests: z.lazy(() => adCampaignBaseSchema.merge(adCampaignRelationsSchema)).array(),
})

export const geoGroupSchema = geoGroupBaseSchema
  .merge(geoGroupRelationsSchema)

export const geoGroupCreateSchema = geoGroupBaseSchema.partial({
  id: true,
  countries: true,
  audiences: true,
  adCampaignTests: true,
})

export const geoGroupUpdateSchema = geoGroupBaseSchema
  .partial()
  
