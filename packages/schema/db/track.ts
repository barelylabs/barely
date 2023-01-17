import * as z from "zod"
import { ArtistRelations, artistRelationsSchema, artistBaseSchema } from "./artist"
import { FileRelations, fileRelationsSchema, fileBaseSchema } from "./file"
import { TrackRenderRelations, trackRenderRelationsSchema, trackRenderBaseSchema } from "./trackrender"
import { TrackAppLinkRelations, trackAppLinkRelationsSchema, trackAppLinkBaseSchema } from "./trackapplink"
import { CampaignRelations, campaignRelationsSchema, campaignBaseSchema } from "./campaign"

export const trackBaseSchema = z.object({
  id: z.string(),
  name: z.string(),
  artistId: z.string(),
  released: z.boolean(),
  releaseDate: z.date().nullable(),
  isrc: z.string().nullable(),
  spotifyId: z.string().nullable(),
  masterMp3Id: z.string().nullable(),
  masterWavId: z.string().nullable(),
})

export interface TrackRelations {
  artist: z.infer<typeof artistBaseSchema> & ArtistRelations
  masterMp3: (z.infer<typeof fileBaseSchema> & FileRelations) | null
  masterWav: (z.infer<typeof fileBaseSchema> & FileRelations) | null
  vids: (z.infer<typeof fileBaseSchema> & FileRelations)[]
  trackRenders: (z.infer<typeof trackRenderBaseSchema> & TrackRenderRelations)[]
  appLinks: (z.infer<typeof trackAppLinkBaseSchema> & TrackAppLinkRelations)[]
  campaigns: (z.infer<typeof campaignBaseSchema> & CampaignRelations)[]
}

export const trackRelationsSchema: z.ZodObject<{
  [K in keyof TrackRelations]: z.ZodType<TrackRelations[K]>
}> = z.object({
  artist: z.lazy(() => artistBaseSchema.merge(artistRelationsSchema)),
  masterMp3: z.lazy(() => fileBaseSchema.merge(fileRelationsSchema)).nullable(),
  masterWav: z.lazy(() => fileBaseSchema.merge(fileRelationsSchema)).nullable(),
  vids: z.lazy(() => fileBaseSchema.merge(fileRelationsSchema)).array(),
  trackRenders: z.lazy(() => trackRenderBaseSchema.merge(trackRenderRelationsSchema)).array(),
  appLinks: z.lazy(() => trackAppLinkBaseSchema.merge(trackAppLinkRelationsSchema)).array(),
  campaigns: z.lazy(() => campaignBaseSchema.merge(campaignRelationsSchema)).array(),
})

export const trackSchema = trackBaseSchema
  .merge(trackRelationsSchema)

export const trackCreateSchema = trackBaseSchema
  .extend({
    releaseDate: trackBaseSchema.shape.releaseDate.unwrap(),
    isrc: trackBaseSchema.shape.isrc.unwrap(),
    spotifyId: trackBaseSchema.shape.spotifyId.unwrap(),
    masterMp3Id: trackBaseSchema.shape.masterMp3Id.unwrap(),
    masterWavId: trackBaseSchema.shape.masterWavId.unwrap(),
  }).partial({
    id: true,
    artistId: true,
    releaseDate: true,
    isrc: true,
    spotifyId: true,
    masterMp3: true,
    masterMp3Id: true,
    masterWav: true,
    masterWavId: true,
    vids: true,
    trackRenders: true,
    appLinks: true,
    campaigns: true,
  })

export const trackUpdateSchema = trackBaseSchema
  .extend({
    releaseDate: trackBaseSchema.shape.releaseDate.unwrap(),
    isrc: trackBaseSchema.shape.isrc.unwrap(),
    spotifyId: trackBaseSchema.shape.spotifyId.unwrap(),
    masterMp3Id: trackBaseSchema.shape.masterMp3Id.unwrap(),
    masterWavId: trackBaseSchema.shape.masterWavId.unwrap(),
  })
  .partial()
  
