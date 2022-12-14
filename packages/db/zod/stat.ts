import * as z from "zod"
import { adPlatformSchema } from "./adplatform"
import { accountTypeSchema } from "./accounttype"
import { AdRelations, adRelationsSchema, adBaseSchema } from "./ad"
import { PlaylistRelations, playlistRelationsSchema, playlistBaseSchema } from "./playlist"
import { ArtistAccountRelations, artistAccountRelationsSchema, artistAccountBaseSchema } from "./artistaccount"

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
  view: z.number().int().nullable(),
  watch25: z.number().int().nullable(),
  watch50: z.number().int().nullable(),
  watch75: z.number().int().nullable(),
  watch95: z.number().int().nullable(),
  watch100: z.number().int().nullable(),
  watch60s: z.number().int().nullable(),
  adPlatform: adPlatformSchema.nullable(),
  adId: z.string().nullable(),
  playlistId: z.string().nullable(),
  artistId: z.string().nullable(),
  artistAccountType: accountTypeSchema.nullable(),
  artistAccountId: z.string().nullable(),
})

export interface StatRelations {
  ad: (z.infer<typeof adBaseSchema> & AdRelations) | null
  playlist: (z.infer<typeof playlistBaseSchema> & PlaylistRelations) | null
  artistAccount: (z.infer<typeof artistAccountBaseSchema> & ArtistAccountRelations) | null
}

export const statRelationsSchema: z.ZodObject<{
  [K in keyof StatRelations]: z.ZodType<StatRelations[K]>
}> = z.object({
  ad: z.lazy(() => adBaseSchema.merge(adRelationsSchema)).nullable(),
  playlist: z.lazy(() => playlistBaseSchema.merge(playlistRelationsSchema)).nullable(),
  artistAccount: z.lazy(() => artistAccountBaseSchema.merge(artistAccountRelationsSchema)).nullable(),
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
    view: statBaseSchema.shape.view.unwrap(),
    watch25: statBaseSchema.shape.watch25.unwrap(),
    watch50: statBaseSchema.shape.watch50.unwrap(),
    watch75: statBaseSchema.shape.watch75.unwrap(),
    watch95: statBaseSchema.shape.watch95.unwrap(),
    watch100: statBaseSchema.shape.watch100.unwrap(),
    watch60s: statBaseSchema.shape.watch60s.unwrap(),
    adPlatform: statBaseSchema.shape.adPlatform.unwrap(),
    adId: statBaseSchema.shape.adId.unwrap(),
    playlistId: statBaseSchema.shape.playlistId.unwrap(),
    artistId: statBaseSchema.shape.artistId.unwrap(),
    artistAccountType: statBaseSchema.shape.artistAccountType.unwrap(),
    artistAccountId: statBaseSchema.shape.artistAccountId.unwrap(),
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
    view: true,
    watch25: true,
    watch50: true,
    watch75: true,
    watch95: true,
    watch100: true,
    watch60s: true,
    ad: true,
    adPlatform: true,
    adId: true,
    playlist: true,
    playlistId: true,
    artistAccount: true,
    artistId: true,
    artistAccountType: true,
    artistAccountId: true,
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
    view: statBaseSchema.shape.view.unwrap(),
    watch25: statBaseSchema.shape.watch25.unwrap(),
    watch50: statBaseSchema.shape.watch50.unwrap(),
    watch75: statBaseSchema.shape.watch75.unwrap(),
    watch95: statBaseSchema.shape.watch95.unwrap(),
    watch100: statBaseSchema.shape.watch100.unwrap(),
    watch60s: statBaseSchema.shape.watch60s.unwrap(),
    adPlatform: statBaseSchema.shape.adPlatform.unwrap(),
    adId: statBaseSchema.shape.adId.unwrap(),
    playlistId: statBaseSchema.shape.playlistId.unwrap(),
    artistId: statBaseSchema.shape.artistId.unwrap(),
    artistAccountType: statBaseSchema.shape.artistAccountType.unwrap(),
    artistAccountId: statBaseSchema.shape.artistAccountId.unwrap(),
  })
  .partial()
  
