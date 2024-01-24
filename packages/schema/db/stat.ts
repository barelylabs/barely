import * as z from "zod"
import { streamingPlatformSchema } from "./streamingplatform"
import { AdRelations, adRelationsSchema, adBaseSchema } from "./ad"
import { AccountRelations, accountRelationsSchema, accountBaseSchema } from "./account"
import { PlaylistRelations, playlistRelationsSchema, playlistBaseSchema } from "./playlist"
import { TrackRelations, trackRelationsSchema, trackBaseSchema } from "./track"

export const statBaseSchema = z.object({
  id: z.string(),
  date: z.date(),
  listeners: z.number().int().nullable(),
  streams: z.number().int().nullable(),
  likes: z.number().int().nullable(),
  saves: z.number().int().nullable(),
  followers: z.number().int().nullable(),
  newFollowers: z.number().int().nullable(),
  spend: z.number().nullable(),
  clicks: z.number().int().nullable(),
  impressions: z.number().int().nullable(),
  views: z.number().int().nullable(),
  watch25: z.number().int().nullable(),
  watch50: z.number().int().nullable(),
  watch75: z.number().int().nullable(),
  watch95: z.number().int().nullable(),
  watch100: z.number().int().nullable(),
  watch60s: z.number().int().nullable(),
  adId: z.string().nullable(),
  accountId: z.string().nullable(),
  playlistId: z.string().nullable(),
  trackId: z.string().nullable(),
  streamingPlatform: streamingPlatformSchema.nullable(),
})

export interface StatRelations {
  ad: (z.infer<typeof adBaseSchema> & AdRelations) | null
  account: (z.infer<typeof accountBaseSchema> & AccountRelations) | null
  playlist: (z.infer<typeof playlistBaseSchema> & PlaylistRelations) | null
  track: (z.infer<typeof trackBaseSchema> & TrackRelations) | null
}

export const statRelationsSchema: z.ZodObject<{
  [K in keyof StatRelations]: z.ZodType<StatRelations[K]>
}> = z.object({
  ad: z.lazy(() => adBaseSchema.merge(adRelationsSchema)).nullable(),
  account: z.lazy(() => accountBaseSchema.merge(accountRelationsSchema)).nullable(),
  playlist: z.lazy(() => playlistBaseSchema.merge(playlistRelationsSchema)).nullable(),
  track: z.lazy(() => trackBaseSchema.merge(trackRelationsSchema)).nullable(),
})

export const statSchema = statBaseSchema
  .merge(statRelationsSchema)

export const statCreateSchema = statBaseSchema
  .extend({
    listeners: statBaseSchema.shape.listeners.unwrap(),
    streams: statBaseSchema.shape.streams.unwrap(),
    likes: statBaseSchema.shape.likes.unwrap(),
    saves: statBaseSchema.shape.saves.unwrap(),
    followers: statBaseSchema.shape.followers.unwrap(),
    newFollowers: statBaseSchema.shape.newFollowers.unwrap(),
    spend: statBaseSchema.shape.spend.unwrap(),
    clicks: statBaseSchema.shape.clicks.unwrap(),
    impressions: statBaseSchema.shape.impressions.unwrap(),
    views: statBaseSchema.shape.views.unwrap(),
    watch25: statBaseSchema.shape.watch25.unwrap(),
    watch50: statBaseSchema.shape.watch50.unwrap(),
    watch75: statBaseSchema.shape.watch75.unwrap(),
    watch95: statBaseSchema.shape.watch95.unwrap(),
    watch100: statBaseSchema.shape.watch100.unwrap(),
    watch60s: statBaseSchema.shape.watch60s.unwrap(),
    adId: statBaseSchema.shape.adId.unwrap(),
    accountId: statBaseSchema.shape.accountId.unwrap(),
    playlistId: statBaseSchema.shape.playlistId.unwrap(),
    trackId: statBaseSchema.shape.trackId.unwrap(),
    streamingPlatform: statBaseSchema.shape.streamingPlatform.unwrap(),
  }).partial({
    id: true,
    listeners: true,
    streams: true,
    likes: true,
    saves: true,
    followers: true,
    newFollowers: true,
    spend: true,
    clicks: true,
    impressions: true,
    views: true,
    watch25: true,
    watch50: true,
    watch75: true,
    watch95: true,
    watch100: true,
    watch60s: true,
    ad: true,
    adId: true,
    account: true,
    accountId: true,
    playlist: true,
    playlistId: true,
    track: true,
    trackId: true,
    streamingPlatform: true,
  })

export const statUpdateSchema = statBaseSchema
  .extend({
    listeners: statBaseSchema.shape.listeners.unwrap(),
    streams: statBaseSchema.shape.streams.unwrap(),
    likes: statBaseSchema.shape.likes.unwrap(),
    saves: statBaseSchema.shape.saves.unwrap(),
    followers: statBaseSchema.shape.followers.unwrap(),
    newFollowers: statBaseSchema.shape.newFollowers.unwrap(),
    spend: statBaseSchema.shape.spend.unwrap(),
    clicks: statBaseSchema.shape.clicks.unwrap(),
    impressions: statBaseSchema.shape.impressions.unwrap(),
    views: statBaseSchema.shape.views.unwrap(),
    watch25: statBaseSchema.shape.watch25.unwrap(),
    watch50: statBaseSchema.shape.watch50.unwrap(),
    watch75: statBaseSchema.shape.watch75.unwrap(),
    watch95: statBaseSchema.shape.watch95.unwrap(),
    watch100: statBaseSchema.shape.watch100.unwrap(),
    watch60s: statBaseSchema.shape.watch60s.unwrap(),
    adId: statBaseSchema.shape.adId.unwrap(),
    accountId: statBaseSchema.shape.accountId.unwrap(),
    playlistId: statBaseSchema.shape.playlistId.unwrap(),
    trackId: statBaseSchema.shape.trackId.unwrap(),
    streamingPlatform: statBaseSchema.shape.streamingPlatform.unwrap(),
  })
  .partial()
  
