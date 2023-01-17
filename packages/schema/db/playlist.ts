import * as z from "zod"
import { playlistPlatformSchema } from "./playlistplatform"
import { CampaignRelations, campaignRelationsSchema, campaignBaseSchema } from "./campaign"
import { AccountRelations, accountRelationsSchema, accountBaseSchema } from "./account"
import { FileRelations, fileRelationsSchema, fileBaseSchema } from "./file"
import { LinkRelations, linkRelationsSchema, linkBaseSchema } from "./link"
import { StatRelations, statRelationsSchema, statBaseSchema } from "./stat"
import { PlacementRelations, placementRelationsSchema, placementBaseSchema } from "./placement"
import { UserRelations, userRelationsSchema, userBaseSchema } from "./user"
import { ArtistRelations, artistRelationsSchema, artistBaseSchema } from "./artist"

export const playlistBaseSchema = z.object({
  id: z.string(),
  platform: playlistPlatformSchema,
  platformId: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  public: z.boolean(),
  userOwned: z.boolean(),
  totalTracks: z.number().int().nullable(),
  forTesting: z.boolean(),
  accountId: z.string(),
  coverId: z.string(),
  linkId: z.string().nullable(),
  cloneParentId: z.string().nullable(),
  userId: z.string(),
})

export interface PlaylistRelations {
  campaigns: (z.infer<typeof campaignBaseSchema> & CampaignRelations)[]
  account: z.infer<typeof accountBaseSchema> & AccountRelations
  cover: z.infer<typeof fileBaseSchema> & FileRelations
  link: (z.infer<typeof linkBaseSchema> & LinkRelations) | null
  stats: (z.infer<typeof statBaseSchema> & StatRelations)[]
  cloneChildren: (z.infer<typeof playlistBaseSchema> & PlaylistRelations)[]
  cloneParent: (z.infer<typeof playlistBaseSchema> & PlaylistRelations) | null
  placements: (z.infer<typeof placementBaseSchema> & PlacementRelations)[]
  user: z.infer<typeof userBaseSchema> & UserRelations
  artists: (z.infer<typeof artistBaseSchema> & ArtistRelations)[]
}

export const playlistRelationsSchema: z.ZodObject<{
  [K in keyof PlaylistRelations]: z.ZodType<PlaylistRelations[K]>
}> = z.object({
  campaigns: z.lazy(() => campaignBaseSchema.merge(campaignRelationsSchema)).array(),
  account: z.lazy(() => accountBaseSchema.merge(accountRelationsSchema)),
  cover: z.lazy(() => fileBaseSchema.merge(fileRelationsSchema)),
  link: z.lazy(() => linkBaseSchema.merge(linkRelationsSchema)).nullable(),
  stats: z.lazy(() => statBaseSchema.merge(statRelationsSchema)).array(),
  cloneChildren: z.lazy(() => playlistBaseSchema.merge(playlistRelationsSchema)).array(),
  cloneParent: z.lazy(() => playlistBaseSchema.merge(playlistRelationsSchema)).nullable(),
  placements: z.lazy(() => placementBaseSchema.merge(placementRelationsSchema)).array(),
  user: z.lazy(() => userBaseSchema.merge(userRelationsSchema)),
  artists: z.lazy(() => artistBaseSchema.merge(artistRelationsSchema)).array(),
})

export const playlistSchema = playlistBaseSchema
  .merge(playlistRelationsSchema)

export const playlistCreateSchema = playlistBaseSchema
  .extend({
    description: playlistBaseSchema.shape.description.unwrap(),
    totalTracks: playlistBaseSchema.shape.totalTracks.unwrap(),
    linkId: playlistBaseSchema.shape.linkId.unwrap(),
    cloneParentId: playlistBaseSchema.shape.cloneParentId.unwrap(),
  }).partial({
    id: true,
    description: true,
    totalTracks: true,
    campaigns: true,
    accountId: true,
    coverId: true,
    link: true,
    linkId: true,
    stats: true,
    cloneChildren: true,
    cloneParent: true,
    cloneParentId: true,
    placements: true,
    userId: true,
    artists: true,
  })

export const playlistUpdateSchema = playlistBaseSchema
  .extend({
    description: playlistBaseSchema.shape.description.unwrap(),
    totalTracks: playlistBaseSchema.shape.totalTracks.unwrap(),
    linkId: playlistBaseSchema.shape.linkId.unwrap(),
    cloneParentId: playlistBaseSchema.shape.cloneParentId.unwrap(),
  })
  .partial()
  
