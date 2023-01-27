import * as z from "zod"
import { CountryRelations, countryRelationsSchema, countryBaseSchema } from "./country"
import { TeamRelations, teamRelationsSchema, teamBaseSchema } from "./team"
import { AudienceRelations, audienceRelationsSchema, audienceBaseSchema } from "./audience"
import { AdCampaignRelations, adCampaignRelationsSchema, adCampaignBaseSchema } from "./adcampaign"

export const geoGroupBaseSchema = z.object({
  id: z.string(),
  name: z.string(),
  teamId: z.string().nullable(),
  public: z.boolean(),
})

export interface GeoGroupRelations {
  countries: (z.infer<typeof countryBaseSchema> & CountryRelations)[]
  team: (z.infer<typeof teamBaseSchema> & TeamRelations) | null
  audiences: (z.infer<typeof audienceBaseSchema> & AudienceRelations)[]
  adCampaignTests: (z.infer<typeof adCampaignBaseSchema> & AdCampaignRelations)[]
}

export const geoGroupRelationsSchema: z.ZodObject<{
  [K in keyof GeoGroupRelations]: z.ZodType<GeoGroupRelations[K]>
}> = z.object({
  countries: z.lazy(() => countryBaseSchema.merge(countryRelationsSchema)).array(),
  team: z.lazy(() => teamBaseSchema.merge(teamRelationsSchema)).nullable(),
  audiences: z.lazy(() => audienceBaseSchema.merge(audienceRelationsSchema)).array(),
  adCampaignTests: z.lazy(() => adCampaignBaseSchema.merge(adCampaignRelationsSchema)).array(),
})

export const geoGroupSchema = geoGroupBaseSchema
  .merge(geoGroupRelationsSchema)

export const geoGroupCreateSchema = geoGroupBaseSchema
  .extend({
    teamId: geoGroupBaseSchema.shape.teamId.unwrap(),
  }).partial({
    id: true,
    countries: true,
    team: true,
    teamId: true,
    public: true,
    audiences: true,
    adCampaignTests: true,
  })

export const geoGroupUpdateSchema = geoGroupBaseSchema
  .extend({
    teamId: geoGroupBaseSchema.shape.teamId.unwrap(),
  })
  .partial()
  
