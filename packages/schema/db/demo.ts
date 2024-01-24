import * as z from "zod"
import { genderSchema } from "./gender"
import { TeamRelations, teamRelationsSchema, teamBaseSchema } from "./team"
import { AudienceRelations, audienceRelationsSchema, audienceBaseSchema } from "./audience"
import { AdCampaignRelations, adCampaignRelationsSchema, adCampaignBaseSchema } from "./adcampaign"

export const demoBaseSchema = z.object({
  id: z.string(),
  name: z.string(),
  ageMin: z.number().int(),
  ageMax: z.number().int(),
  gender: genderSchema,
  onlyEnglish: z.boolean(),
  teamId: z.string().nullable(),
  public: z.boolean(),
})

export interface DemoRelations {
  team: (z.infer<typeof teamBaseSchema> & TeamRelations) | null
  audiences: (z.infer<typeof audienceBaseSchema> & AudienceRelations)[]
  adCampaigns: (z.infer<typeof adCampaignBaseSchema> & AdCampaignRelations)[]
}

export const demoRelationsSchema: z.ZodObject<{
  [K in keyof DemoRelations]: z.ZodType<DemoRelations[K]>
}> = z.object({
  team: z.lazy(() => teamBaseSchema.merge(teamRelationsSchema)).nullable(),
  audiences: z.lazy(() => audienceBaseSchema.merge(audienceRelationsSchema)).array(),
  adCampaigns: z.lazy(() => adCampaignBaseSchema.merge(adCampaignRelationsSchema)).array(),
})

export const demoSchema = demoBaseSchema
  .merge(demoRelationsSchema)

export const demoCreateSchema = demoBaseSchema
  .extend({
    teamId: demoBaseSchema.shape.teamId.unwrap(),
  }).partial({
    id: true,
    ageMin: true,
    team: true,
    teamId: true,
    public: true,
    audiences: true,
    adCampaigns: true,
  })

export const demoUpdateSchema = demoBaseSchema
  .extend({
    teamId: demoBaseSchema.shape.teamId.unwrap(),
  })
  .partial()
  
