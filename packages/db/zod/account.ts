import * as z from "zod"
import { accountTypeSchema } from "./accounttype"
import { accountProviderSchema } from "./accountprovider"
import { UserRelations, userRelationsSchema, userBaseSchema } from "./user"
import { ArtistAccountRelations, artistAccountRelationsSchema, artistAccountBaseSchema } from "./artistaccount"
import { PlaylistRelations, playlistRelationsSchema, playlistBaseSchema } from "./playlist"
import { AdCreativeRelations, adCreativeRelationsSchema, adCreativeBaseSchema } from "./adcreative"
import { AdCampaignRelations, adCampaignRelationsSchema, adCampaignBaseSchema } from "./adcampaign"

export const accountBaseSchema = z.object({
  id: z.string(),
  userId: z.string(),
  type: accountTypeSchema,
  provider: accountProviderSchema,
  providerAccountId: z.string(),
  refresh_token: z.string().nullable(),
  access_token: z.string().nullable(),
  expires_at: z.number().int().nullable(),
  token_type: z.string().nullable(),
  scope: z.string().nullable(),
  id_token: z.string().nullable(),
  session_state: z.string().nullable(),
  artistId: z.string().nullable(),
})

export interface AccountRelations {
  user: z.infer<typeof userBaseSchema> & UserRelations
  parentAccounts: (z.infer<typeof accountBaseSchema> & AccountRelations)[]
  childAccounts: (z.infer<typeof accountBaseSchema> & AccountRelations)[]
  artist: (z.infer<typeof artistAccountBaseSchema> & ArtistAccountRelations) | null
  playlists: (z.infer<typeof playlistBaseSchema> & PlaylistRelations)[]
  metaAdCreative: (z.infer<typeof adCreativeBaseSchema> & AdCreativeRelations)[]
  metaAdCampaigns: (z.infer<typeof adCampaignBaseSchema> & AdCampaignRelations)[]
  tikTokAdCreative: (z.infer<typeof adCreativeBaseSchema> & AdCreativeRelations)[]
  tikTokAdCampaigns: (z.infer<typeof adCampaignBaseSchema> & AdCampaignRelations)[]
}

export const accountRelationsSchema: z.ZodObject<{
  [K in keyof AccountRelations]: z.ZodType<AccountRelations[K]>
}> = z.object({
  user: z.lazy(() => userBaseSchema.merge(userRelationsSchema)),
  parentAccounts: z.lazy(() => accountBaseSchema.merge(accountRelationsSchema)).array(),
  childAccounts: z.lazy(() => accountBaseSchema.merge(accountRelationsSchema)).array(),
  artist: z.lazy(() => artistAccountBaseSchema.merge(artistAccountRelationsSchema)).nullable(),
  playlists: z.lazy(() => playlistBaseSchema.merge(playlistRelationsSchema)).array(),
  metaAdCreative: z.lazy(() => adCreativeBaseSchema.merge(adCreativeRelationsSchema)).array(),
  metaAdCampaigns: z.lazy(() => adCampaignBaseSchema.merge(adCampaignRelationsSchema)).array(),
  tikTokAdCreative: z.lazy(() => adCreativeBaseSchema.merge(adCreativeRelationsSchema)).array(),
  tikTokAdCampaigns: z.lazy(() => adCampaignBaseSchema.merge(adCampaignRelationsSchema)).array(),
})

export const accountSchema = accountBaseSchema
  .merge(accountRelationsSchema)

export const accountCreateSchema = accountBaseSchema
  .extend({
    refresh_token: accountBaseSchema.shape.refresh_token.unwrap(),
    access_token: accountBaseSchema.shape.access_token.unwrap(),
    expires_at: accountBaseSchema.shape.expires_at.unwrap(),
    token_type: accountBaseSchema.shape.token_type.unwrap(),
    scope: accountBaseSchema.shape.scope.unwrap(),
    id_token: accountBaseSchema.shape.id_token.unwrap(),
    session_state: accountBaseSchema.shape.session_state.unwrap(),
    artistId: accountBaseSchema.shape.artistId.unwrap(),
  }).partial({
    id: true,
    userId: true,
    refresh_token: true,
    access_token: true,
    expires_at: true,
    token_type: true,
    scope: true,
    id_token: true,
    session_state: true,
    parentAccounts: true,
    childAccounts: true,
    artist: true,
    artistId: true,
    playlists: true,
    metaAdCreative: true,
    metaAdCampaigns: true,
    tikTokAdCreative: true,
    tikTokAdCampaigns: true,
  })

export const accountUpdateSchema = accountBaseSchema
  .extend({
    refresh_token: accountBaseSchema.shape.refresh_token.unwrap(),
    access_token: accountBaseSchema.shape.access_token.unwrap(),
    expires_at: accountBaseSchema.shape.expires_at.unwrap(),
    token_type: accountBaseSchema.shape.token_type.unwrap(),
    scope: accountBaseSchema.shape.scope.unwrap(),
    id_token: accountBaseSchema.shape.id_token.unwrap(),
    session_state: accountBaseSchema.shape.session_state.unwrap(),
    artistId: accountBaseSchema.shape.artistId.unwrap(),
  })
  .partial()
  
