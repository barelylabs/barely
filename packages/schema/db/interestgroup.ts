import * as z from "zod"
import { InterestRelations, interestRelationsSchema, interestBaseSchema } from "./interest"
import { AudienceRelations, audienceRelationsSchema, audienceBaseSchema } from "./audience"
import { AdCampaignRelations, adCampaignRelationsSchema, adCampaignBaseSchema } from "./adcampaign"
import { TeamRelations, teamRelationsSchema, teamBaseSchema } from "./team"

export const interestGroupBaseSchema = z.object({
  id: z.string(),
  name: z.string(),
  teamId: z.string().nullable(),
  public: z.boolean(),
})

export interface InterestGroupRelations {
  interests: (z.infer<typeof interestBaseSchema> & InterestRelations)[]
  includeIn: (z.infer<typeof audienceBaseSchema> & AudienceRelations)[]
  excludeIn: (z.infer<typeof audienceBaseSchema> & AudienceRelations)[]
  adCampaigns: (z.infer<typeof adCampaignBaseSchema> & AdCampaignRelations)[]
  team: (z.infer<typeof teamBaseSchema> & TeamRelations) | null
}

export const interestGroupRelationsSchema: z.ZodObject<{
  [K in keyof InterestGroupRelations]: z.ZodType<InterestGroupRelations[K]>
}> = z.object({
  interests: z.lazy(() => interestBaseSchema.merge(interestRelationsSchema)).array(),
  includeIn: z.lazy(() => audienceBaseSchema.merge(audienceRelationsSchema)).array(),
  excludeIn: z.lazy(() => audienceBaseSchema.merge(audienceRelationsSchema)).array(),
  adCampaigns: z.lazy(() => adCampaignBaseSchema.merge(adCampaignRelationsSchema)).array(),
  team: z.lazy(() => teamBaseSchema.merge(teamRelationsSchema)).nullable(),
})

export const interestGroupSchema = interestGroupBaseSchema
  .merge(interestGroupRelationsSchema)

export const interestGroupCreateSchema = interestGroupBaseSchema
  .extend({
    teamId: interestGroupBaseSchema.shape.teamId.unwrap(),
  }).partial({
    id: true,
    interests: true,
    includeIn: true,
    excludeIn: true,
    adCampaigns: true,
    team: true,
    teamId: true,
    public: true,
  })

export const interestGroupUpdateSchema = interestGroupBaseSchema
  .extend({
    teamId: interestGroupBaseSchema.shape.teamId.unwrap(),
  })
  .partial()
  
