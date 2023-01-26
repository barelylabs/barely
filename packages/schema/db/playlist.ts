import * as z from "zod"
import { UserRelations, userRelationsSchema, userBaseSchema } from "./user"
import { PlaylistAccountRelations, playlistAccountRelationsSchema, playlistAccountBaseSchema } from "./playlistaccount"
import { CampaignRelations, campaignRelationsSchema, campaignBaseSchema } from "./campaign"
import { PlacementRelations, placementRelationsSchema, placementBaseSchema } from "./placement"
import { FileRelations, fileRelationsSchema, fileBaseSchema } from "./file"
import { PlaylistCoverRenderRelations, playlistCoverRenderRelationsSchema, playlistCoverRenderBaseSchema } from "./playlistcoverrender"
import { LinkRelations, linkRelationsSchema, linkBaseSchema } from "./link"
import { StatRelations, statRelationsSchema, statBaseSchema } from "./stat"

export const playlistBaseSchema = z.object({
  id: z.string(),
  artistId: z.string(),
  appleMusicId: z.string().nullable(),
  deezerId: z.string().nullable(),
  soundcloudId: z.string().nullable(),
  spotifyId: z.string().nullable(),
  tidalId: z.string().nullable(),
  youtubeId: z.string().nullable(),
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
  artist: z.infer<typeof userBaseSchema> & UserRelations
  accounts: (z.infer<typeof playlistAccountBaseSchema> & PlaylistAccountRelations)[]
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
  artist: z.lazy(() => userBaseSchema.merge(userRelationsSchema)),
  accounts: z.lazy(() => playlistAccountBaseSchema.merge(playlistAccountRelationsSchema)).array(),
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
    deezerId: playlistBaseSchema.shape.deezerId.unwrap(),
    soundcloudId: playlistBaseSchema.shape.soundcloudId.unwrap(),
    spotifyId: playlistBaseSchema.shape.spotifyId.unwrap(),
    tidalId: playlistBaseSchema.shape.tidalId.unwrap(),
    youtubeId: playlistBaseSchema.shape.youtubeId.unwrap(),
    description: playlistBaseSchema.shape.description.unwrap(),
    totalTracks: playlistBaseSchema.shape.totalTracks.unwrap(),
    linkId: playlistBaseSchema.shape.linkId.unwrap(),
    cloneParentId: playlistBaseSchema.shape.cloneParentId.unwrap(),
  }).partial({
    id: true,
    artistId: true,
    accounts: true,
    appleMusicId: true,
    deezerId: true,
    soundcloudId: true,
    spotifyId: true,
    tidalId: true,
    youtubeId: true,
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
    deezerId: playlistBaseSchema.shape.deezerId.unwrap(),
    soundcloudId: playlistBaseSchema.shape.soundcloudId.unwrap(),
    spotifyId: playlistBaseSchema.shape.spotifyId.unwrap(),
    tidalId: playlistBaseSchema.shape.tidalId.unwrap(),
    youtubeId: playlistBaseSchema.shape.youtubeId.unwrap(),
    description: playlistBaseSchema.shape.description.unwrap(),
    totalTracks: playlistBaseSchema.shape.totalTracks.unwrap(),
    linkId: playlistBaseSchema.shape.linkId.unwrap(),
    cloneParentId: playlistBaseSchema.shape.cloneParentId.unwrap(),
  })
  .partial()
  
