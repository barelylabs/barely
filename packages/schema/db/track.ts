import * as z from "zod"
import { UserRelations, userRelationsSchema, userBaseSchema } from "./user"
import { FileRelations, fileRelationsSchema, fileBaseSchema } from "./file"
import { TrackRenderRelations, trackRenderRelationsSchema, trackRenderBaseSchema } from "./trackrender"
import { TrackAppLinkRelations, trackAppLinkRelationsSchema, trackAppLinkBaseSchema } from "./trackapplink"
import { CampaignRelations, campaignRelationsSchema, campaignBaseSchema } from "./campaign"
import { StatRelations, statRelationsSchema, statBaseSchema } from "./stat"

export const trackBaseSchema = z.object({
  id: z.string(),
  name: z.string(),
  artistId: z.string(),
  isrc: z.string().nullable(),
  appleMusicId: z.string().nullable(),
  deezerId: z.string().nullable(),
  soundcloudId: z.string().nullable(),
  spotifyId: z.string().nullable(),
  tidalId: z.string().nullable(),
  youtubeId: z.string().nullable(),
  released: z.boolean(),
  releaseDate: z.date().nullable(),
  masterMp3Id: z.string().nullable(),
  masterWavId: z.string().nullable(),
})

export interface TrackRelations {
  artist: z.infer<typeof userBaseSchema> & UserRelations
  masterMp3: (z.infer<typeof fileBaseSchema> & FileRelations) | null
  masterWav: (z.infer<typeof fileBaseSchema> & FileRelations) | null
  vids: (z.infer<typeof fileBaseSchema> & FileRelations)[]
  trackRenders: (z.infer<typeof trackRenderBaseSchema> & TrackRenderRelations)[]
  appLinks: (z.infer<typeof trackAppLinkBaseSchema> & TrackAppLinkRelations)[]
  campaigns: (z.infer<typeof campaignBaseSchema> & CampaignRelations)[]
  stats: (z.infer<typeof statBaseSchema> & StatRelations)[]
}

export const trackRelationsSchema: z.ZodObject<{
  [K in keyof TrackRelations]: z.ZodType<TrackRelations[K]>
}> = z.object({
  artist: z.lazy(() => userBaseSchema.merge(userRelationsSchema)),
  masterMp3: z.lazy(() => fileBaseSchema.merge(fileRelationsSchema)).nullable(),
  masterWav: z.lazy(() => fileBaseSchema.merge(fileRelationsSchema)).nullable(),
  vids: z.lazy(() => fileBaseSchema.merge(fileRelationsSchema)).array(),
  trackRenders: z.lazy(() => trackRenderBaseSchema.merge(trackRenderRelationsSchema)).array(),
  appLinks: z.lazy(() => trackAppLinkBaseSchema.merge(trackAppLinkRelationsSchema)).array(),
  campaigns: z.lazy(() => campaignBaseSchema.merge(campaignRelationsSchema)).array(),
  stats: z.lazy(() => statBaseSchema.merge(statRelationsSchema)).array(),
})

export const trackSchema = trackBaseSchema
  .merge(trackRelationsSchema)

export const trackCreateSchema = trackBaseSchema
  .extend({
    isrc: trackBaseSchema.shape.isrc.unwrap(),
    appleMusicId: trackBaseSchema.shape.appleMusicId.unwrap(),
    deezerId: trackBaseSchema.shape.deezerId.unwrap(),
    soundcloudId: trackBaseSchema.shape.soundcloudId.unwrap(),
    spotifyId: trackBaseSchema.shape.spotifyId.unwrap(),
    tidalId: trackBaseSchema.shape.tidalId.unwrap(),
    youtubeId: trackBaseSchema.shape.youtubeId.unwrap(),
    releaseDate: trackBaseSchema.shape.releaseDate.unwrap(),
    masterMp3Id: trackBaseSchema.shape.masterMp3Id.unwrap(),
    masterWavId: trackBaseSchema.shape.masterWavId.unwrap(),
  }).partial({
    id: true,
    artistId: true,
    isrc: true,
    appleMusicId: true,
    deezerId: true,
    soundcloudId: true,
    spotifyId: true,
    tidalId: true,
    youtubeId: true,
    releaseDate: true,
    masterMp3: true,
    masterMp3Id: true,
    masterWav: true,
    masterWavId: true,
    vids: true,
    trackRenders: true,
    appLinks: true,
    campaigns: true,
    stats: true,
  })

export const trackUpdateSchema = trackBaseSchema
  .extend({
    isrc: trackBaseSchema.shape.isrc.unwrap(),
    appleMusicId: trackBaseSchema.shape.appleMusicId.unwrap(),
    deezerId: trackBaseSchema.shape.deezerId.unwrap(),
    soundcloudId: trackBaseSchema.shape.soundcloudId.unwrap(),
    spotifyId: trackBaseSchema.shape.spotifyId.unwrap(),
    tidalId: trackBaseSchema.shape.tidalId.unwrap(),
    youtubeId: trackBaseSchema.shape.youtubeId.unwrap(),
    releaseDate: trackBaseSchema.shape.releaseDate.unwrap(),
    masterMp3Id: trackBaseSchema.shape.masterMp3Id.unwrap(),
    masterWavId: trackBaseSchema.shape.masterWavId.unwrap(),
  })
  .partial()
  
