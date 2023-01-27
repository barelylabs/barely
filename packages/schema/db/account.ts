import * as z from "zod"
import { accountPlatformSchema } from "./accountplatform"
import { oAuthProviderSchema } from "./oauthprovider"
import { UserRelations, userRelationsSchema, userBaseSchema } from "./user"
import { TeamRelations, teamRelationsSchema, teamBaseSchema } from "./team"
import { PlaylistRelations, playlistRelationsSchema, playlistBaseSchema } from "./playlist"
import { AdCreativeRelations, adCreativeRelationsSchema, adCreativeBaseSchema } from "./adcreative"
import { AdCampaignRelations, adCampaignRelationsSchema, adCampaignBaseSchema } from "./adcampaign"
import { StatRelations, statRelationsSchema, statBaseSchema } from "./stat"

// Helper schema for JSON fields
type Literal = boolean | number | string
type Json = Literal | { [key: string]: Json } | Json[]
const literalSchema = z.union([z.string(), z.number(), z.boolean()])
const jsonSchema: z.ZodSchema<Json> = z.lazy(() =>
  z.union([literalSchema, z.array(jsonSchema), z.record(jsonSchema)]),
)

export const accountBaseSchema = z.object({
  id: z.string(),
  platform: accountPlatformSchema,
  provider: oAuthProviderSchema.nullable(),
  providerUserId: z.string().nullable(),
  email: z.string().nullable(),
  approvedScopes: jsonSchema.nullable(),
  avatarUrl: z.string().nullable(),
  username: z.string().nullable(),
  accessToken: z.string().nullable(),
  parentAccountId: z.string().nullable(),
  userId: z.string(),
  teamId: z.string().nullable(),
  defaultForTeamId: z.string().nullable(),
})

export interface AccountRelations {
  parentAccount: (z.infer<typeof accountBaseSchema> & AccountRelations) | null
  childAccounts: (z.infer<typeof accountBaseSchema> & AccountRelations)[]
  user: z.infer<typeof userBaseSchema> & UserRelations
  team: (z.infer<typeof teamBaseSchema> & TeamRelations) | null
  defaultForTeam: (z.infer<typeof teamBaseSchema> & TeamRelations) | null
  appleMusicPlaylists: (z.infer<typeof playlistBaseSchema> & PlaylistRelations)[]
  deezerPlaylists: (z.infer<typeof playlistBaseSchema> & PlaylistRelations)[]
  soundCloudPlaylists: (z.infer<typeof playlistBaseSchema> & PlaylistRelations)[]
  spotifyPlaylists: (z.infer<typeof playlistBaseSchema> & PlaylistRelations)[]
  tidalPlaylists: (z.infer<typeof playlistBaseSchema> & PlaylistRelations)[]
  youtubePlaylists: (z.infer<typeof playlistBaseSchema> & PlaylistRelations)[]
  metaAdCreative: (z.infer<typeof adCreativeBaseSchema> & AdCreativeRelations)[]
  metaAdCampaigns: (z.infer<typeof adCampaignBaseSchema> & AdCampaignRelations)[]
  tikTokAdCreative: (z.infer<typeof adCreativeBaseSchema> & AdCreativeRelations)[]
  tikTokAdCampaigns: (z.infer<typeof adCampaignBaseSchema> & AdCampaignRelations)[]
  stats: (z.infer<typeof statBaseSchema> & StatRelations)[]
}

export const accountRelationsSchema: z.ZodObject<{
  [K in keyof AccountRelations]: z.ZodType<AccountRelations[K]>
}> = z.object({
  parentAccount: z.lazy(() => accountBaseSchema.merge(accountRelationsSchema)).nullable(),
  childAccounts: z.lazy(() => accountBaseSchema.merge(accountRelationsSchema)).array(),
  user: z.lazy(() => userBaseSchema.merge(userRelationsSchema)),
  team: z.lazy(() => teamBaseSchema.merge(teamRelationsSchema)).nullable(),
  defaultForTeam: z.lazy(() => teamBaseSchema.merge(teamRelationsSchema)).nullable(),
  appleMusicPlaylists: z.lazy(() => playlistBaseSchema.merge(playlistRelationsSchema)).array(),
  deezerPlaylists: z.lazy(() => playlistBaseSchema.merge(playlistRelationsSchema)).array(),
  soundCloudPlaylists: z.lazy(() => playlistBaseSchema.merge(playlistRelationsSchema)).array(),
  spotifyPlaylists: z.lazy(() => playlistBaseSchema.merge(playlistRelationsSchema)).array(),
  tidalPlaylists: z.lazy(() => playlistBaseSchema.merge(playlistRelationsSchema)).array(),
  youtubePlaylists: z.lazy(() => playlistBaseSchema.merge(playlistRelationsSchema)).array(),
  metaAdCreative: z.lazy(() => adCreativeBaseSchema.merge(adCreativeRelationsSchema)).array(),
  metaAdCampaigns: z.lazy(() => adCampaignBaseSchema.merge(adCampaignRelationsSchema)).array(),
  tikTokAdCreative: z.lazy(() => adCreativeBaseSchema.merge(adCreativeRelationsSchema)).array(),
  tikTokAdCampaigns: z.lazy(() => adCampaignBaseSchema.merge(adCampaignRelationsSchema)).array(),
  stats: z.lazy(() => statBaseSchema.merge(statRelationsSchema)).array(),
})

export const accountSchema = accountBaseSchema
  .merge(accountRelationsSchema)

export const accountCreateSchema = accountBaseSchema
  .extend({
    provider: accountBaseSchema.shape.provider.unwrap(),
    providerUserId: accountBaseSchema.shape.providerUserId.unwrap(),
    email: accountBaseSchema.shape.email.unwrap(),
    approvedScopes: accountBaseSchema.shape.approvedScopes.unwrap(),
    avatarUrl: accountBaseSchema.shape.avatarUrl.unwrap(),
    username: accountBaseSchema.shape.username.unwrap(),
    accessToken: accountBaseSchema.shape.accessToken.unwrap(),
    parentAccountId: accountBaseSchema.shape.parentAccountId.unwrap(),
    teamId: accountBaseSchema.shape.teamId.unwrap(),
    defaultForTeamId: accountBaseSchema.shape.defaultForTeamId.unwrap(),
  }).partial({
    provider: true,
    providerUserId: true,
    email: true,
    approvedScopes: true,
    avatarUrl: true,
    username: true,
    accessToken: true,
    parentAccount: true,
    parentAccountId: true,
    childAccounts: true,
    userId: true,
    team: true,
    teamId: true,
    defaultForTeam: true,
    defaultForTeamId: true,
    appleMusicPlaylists: true,
    deezerPlaylists: true,
    soundCloudPlaylists: true,
    spotifyPlaylists: true,
    tidalPlaylists: true,
    youtubePlaylists: true,
    metaAdCreative: true,
    metaAdCampaigns: true,
    tikTokAdCreative: true,
    tikTokAdCampaigns: true,
    stats: true,
  })

export const accountUpdateSchema = accountBaseSchema
  .extend({
    provider: accountBaseSchema.shape.provider.unwrap(),
    providerUserId: accountBaseSchema.shape.providerUserId.unwrap(),
    email: accountBaseSchema.shape.email.unwrap(),
    approvedScopes: accountBaseSchema.shape.approvedScopes.unwrap(),
    avatarUrl: accountBaseSchema.shape.avatarUrl.unwrap(),
    username: accountBaseSchema.shape.username.unwrap(),
    accessToken: accountBaseSchema.shape.accessToken.unwrap(),
    parentAccountId: accountBaseSchema.shape.parentAccountId.unwrap(),
    teamId: accountBaseSchema.shape.teamId.unwrap(),
    defaultForTeamId: accountBaseSchema.shape.defaultForTeamId.unwrap(),
  })
  .partial()
  
