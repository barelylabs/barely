import * as z from "zod"
import { TeamRelations, teamRelationsSchema, teamBaseSchema } from "./team"
import { AccountRelations, accountRelationsSchema, accountBaseSchema } from "./account"
import { CampaignRelations, campaignRelationsSchema, campaignBaseSchema } from "./campaign"
import { PlacementRelations, placementRelationsSchema, placementBaseSchema } from "./placement"
import { FileRelations, fileRelationsSchema, fileBaseSchema } from "./file"
import { PlaylistCoverRenderRelations, playlistCoverRenderRelationsSchema, playlistCoverRenderBaseSchema } from "./playlistcoverrender"
import { LinkRelations, linkRelationsSchema, linkBaseSchema } from "./link"
import { StatRelations, statRelationsSchema, statBaseSchema } from "./stat"

export const playlistBaseSchema = z.object({
  id: z.string(),
  teamId: z.string(),
  appleMusicId: z.string().nullable(),
  appleMusicAccountId: z.string().nullable(),
  deezerId: z.string().nullable(),
  deezerAccountId: z.string().nullable(),
  soundCloudId: z.string().nullable(),
  soundCloudAccountId: z.string().nullable(),
  spotifyId: z.string().nullable(),
  spotifyAccountId: z.string().nullable(),
  tidalId: z.string().nullable(),
  tidalAccountId: z.string().nullable(),
  youtubeId: z.string().nullable(),
  youtubeAccountId: z.string().nullable(),
  name: z.string(),
  description: z.string().nullable(),
  public: z.boolean(),
  userOwned: z.boolean(),
  totalTracks: z.number().int().nullable(),
  forTesting: z.boolean(),
  coverId: z.string(),
  linkId: z.string().nullable(),
  cloneParentId: z.string().nullable(),
})

export interface PlaylistRelations {
  team: z.infer<typeof teamBaseSchema> & TeamRelations
  appleMusicAccount: (z.infer<typeof accountBaseSchema> & AccountRelations) | null
  deezerAccount: (z.infer<typeof accountBaseSchema> & AccountRelations) | null
  soundCloudAccount: (z.infer<typeof accountBaseSchema> & AccountRelations) | null
  spotifyAccount: (z.infer<typeof accountBaseSchema> & AccountRelations) | null
  tidalAccount: (z.infer<typeof accountBaseSchema> & AccountRelations) | null
  youtubeAccount: (z.infer<typeof accountBaseSchema> & AccountRelations) | null
  campaigns: (z.infer<typeof campaignBaseSchema> & CampaignRelations)[]
  placements: (z.infer<typeof placementBaseSchema> & PlacementRelations)[]
  cover: z.infer<typeof fileBaseSchema> & FileRelations
  coverRenders: (z.infer<typeof playlistCoverRenderBaseSchema> & PlaylistCoverRenderRelations)[]
  link: (z.infer<typeof linkBaseSchema> & LinkRelations) | null
  cloneChildren: (z.infer<typeof playlistBaseSchema> & PlaylistRelations)[]
  cloneParent: (z.infer<typeof playlistBaseSchema> & PlaylistRelations) | null
  stats: (z.infer<typeof statBaseSchema> & StatRelations)[]
}

export const playlistRelationsSchema: z.ZodObject<{
  [K in keyof PlaylistRelations]: z.ZodType<PlaylistRelations[K]>
}> = z.object({
  team: z.lazy(() => teamBaseSchema.merge(teamRelationsSchema)),
  appleMusicAccount: z.lazy(() => accountBaseSchema.merge(accountRelationsSchema)).nullable(),
  deezerAccount: z.lazy(() => accountBaseSchema.merge(accountRelationsSchema)).nullable(),
  soundCloudAccount: z.lazy(() => accountBaseSchema.merge(accountRelationsSchema)).nullable(),
  spotifyAccount: z.lazy(() => accountBaseSchema.merge(accountRelationsSchema)).nullable(),
  tidalAccount: z.lazy(() => accountBaseSchema.merge(accountRelationsSchema)).nullable(),
  youtubeAccount: z.lazy(() => accountBaseSchema.merge(accountRelationsSchema)).nullable(),
  campaigns: z.lazy(() => campaignBaseSchema.merge(campaignRelationsSchema)).array(),
  placements: z.lazy(() => placementBaseSchema.merge(placementRelationsSchema)).array(),
  cover: z.lazy(() => fileBaseSchema.merge(fileRelationsSchema)),
  coverRenders: z.lazy(() => playlistCoverRenderBaseSchema.merge(playlistCoverRenderRelationsSchema)).array(),
  link: z.lazy(() => linkBaseSchema.merge(linkRelationsSchema)).nullable(),
  cloneChildren: z.lazy(() => playlistBaseSchema.merge(playlistRelationsSchema)).array(),
  cloneParent: z.lazy(() => playlistBaseSchema.merge(playlistRelationsSchema)).nullable(),
  stats: z.lazy(() => statBaseSchema.merge(statRelationsSchema)).array(),
})

export const playlistSchema = playlistBaseSchema
  .merge(playlistRelationsSchema)

export const playlistCreateSchema = playlistBaseSchema
  .extend({
    appleMusicId: playlistBaseSchema.shape.appleMusicId.unwrap(),
    appleMusicAccountId: playlistBaseSchema.shape.appleMusicAccountId.unwrap(),
    deezerId: playlistBaseSchema.shape.deezerId.unwrap(),
    deezerAccountId: playlistBaseSchema.shape.deezerAccountId.unwrap(),
    soundCloudId: playlistBaseSchema.shape.soundCloudId.unwrap(),
    soundCloudAccountId: playlistBaseSchema.shape.soundCloudAccountId.unwrap(),
    spotifyId: playlistBaseSchema.shape.spotifyId.unwrap(),
    spotifyAccountId: playlistBaseSchema.shape.spotifyAccountId.unwrap(),
    tidalId: playlistBaseSchema.shape.tidalId.unwrap(),
    tidalAccountId: playlistBaseSchema.shape.tidalAccountId.unwrap(),
    youtubeId: playlistBaseSchema.shape.youtubeId.unwrap(),
    youtubeAccountId: playlistBaseSchema.shape.youtubeAccountId.unwrap(),
    description: playlistBaseSchema.shape.description.unwrap(),
    totalTracks: playlistBaseSchema.shape.totalTracks.unwrap(),
    linkId: playlistBaseSchema.shape.linkId.unwrap(),
    cloneParentId: playlistBaseSchema.shape.cloneParentId.unwrap(),
  }).partial({
    id: true,
    teamId: true,
    appleMusicId: true,
    appleMusicAccount: true,
    appleMusicAccountId: true,
    deezerId: true,
    deezerAccount: true,
    deezerAccountId: true,
    soundCloudId: true,
    soundCloudAccount: true,
    soundCloudAccountId: true,
    spotifyId: true,
    spotifyAccount: true,
    spotifyAccountId: true,
    tidalId: true,
    tidalAccount: true,
    tidalAccountId: true,
    youtubeId: true,
    youtubeAccount: true,
    youtubeAccountId: true,
    description: true,
    totalTracks: true,
    campaigns: true,
    placements: true,
    coverId: true,
    coverRenders: true,
    link: true,
    linkId: true,
    cloneChildren: true,
    cloneParent: true,
    cloneParentId: true,
    stats: true,
  })

export const playlistUpdateSchema = playlistBaseSchema
  .extend({
    appleMusicId: playlistBaseSchema.shape.appleMusicId.unwrap(),
    appleMusicAccountId: playlistBaseSchema.shape.appleMusicAccountId.unwrap(),
    deezerId: playlistBaseSchema.shape.deezerId.unwrap(),
    deezerAccountId: playlistBaseSchema.shape.deezerAccountId.unwrap(),
    soundCloudId: playlistBaseSchema.shape.soundCloudId.unwrap(),
    soundCloudAccountId: playlistBaseSchema.shape.soundCloudAccountId.unwrap(),
    spotifyId: playlistBaseSchema.shape.spotifyId.unwrap(),
    spotifyAccountId: playlistBaseSchema.shape.spotifyAccountId.unwrap(),
    tidalId: playlistBaseSchema.shape.tidalId.unwrap(),
    tidalAccountId: playlistBaseSchema.shape.tidalAccountId.unwrap(),
    youtubeId: playlistBaseSchema.shape.youtubeId.unwrap(),
    youtubeAccountId: playlistBaseSchema.shape.youtubeAccountId.unwrap(),
    description: playlistBaseSchema.shape.description.unwrap(),
    totalTracks: playlistBaseSchema.shape.totalTracks.unwrap(),
    linkId: playlistBaseSchema.shape.linkId.unwrap(),
    cloneParentId: playlistBaseSchema.shape.cloneParentId.unwrap(),
  })
  .partial()
  
