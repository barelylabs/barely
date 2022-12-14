import * as z from "zod"
import { fileTypeSchema } from "./filetype"
import { fileExtensionSchema } from "./fileextension"
import { ArtistRelations, artistRelationsSchema, artistBaseSchema } from "./artist"
import { TrackRelations, trackRelationsSchema, trackBaseSchema } from "./track"
import { PlaylistRelations, playlistRelationsSchema, playlistBaseSchema } from "./playlist"
import { PlaylistCoverRenderRelations, playlistCoverRenderRelationsSchema, playlistCoverRenderBaseSchema } from "./playlistcoverrender"
import { VidRenderRelations, vidRenderRelationsSchema, vidRenderBaseSchema } from "./vidrender"
import { AdCreativeRelations, adCreativeRelationsSchema, adCreativeBaseSchema } from "./adcreative"
import { VidViewsGroupRelations, vidViewsGroupRelationsSchema, vidViewsGroupBaseSchema } from "./vidviewsgroup"
import { UserRelations, userRelationsSchema, userBaseSchema } from "./user"

export const fileBaseSchema = z.object({
  id: z.string(),
  createdAt: z.date(),
  type: fileTypeSchema,
  name: z.string(),
  extension: fileExtensionSchema,
  description: z.string().nullable(),
  artistId: z.string().nullable(),
  url: z.string(),
  size: z.number().int(),
  width: z.number().int().nullable(),
  height: z.number().int().nullable(),
  fps: z.number().int().nullable(),
  duration: z.number().int().nullable(),
  internal: z.boolean(),
  metaId: z.string().nullable(),
  vidForTrackId: z.string().nullable(),
  thumbnailForId: z.string().nullable(),
  userId: z.string(),
})

export interface FileRelations {
  artist: (z.infer<typeof artistBaseSchema> & ArtistRelations) | null
  vidForTrack: (z.infer<typeof trackBaseSchema> & TrackRelations) | null
  masterMp3ForTrack: (z.infer<typeof trackBaseSchema> & TrackRelations) | null
  masterWavForTrack: (z.infer<typeof trackBaseSchema> & TrackRelations) | null
  playlists: (z.infer<typeof playlistBaseSchema> & PlaylistRelations)[]
  playlistCoverRender: (z.infer<typeof playlistCoverRenderBaseSchema> & PlaylistCoverRenderRelations) | null
  thumbnail: (z.infer<typeof fileBaseSchema> & FileRelations) | null
  thumbnailFor: (z.infer<typeof fileBaseSchema> & FileRelations) | null
  vidRender: (z.infer<typeof vidRenderBaseSchema> & VidRenderRelations) | null
  parentVidForVidRenders: (z.infer<typeof vidRenderBaseSchema> & VidRenderRelations)[]
  adCreatives: (z.infer<typeof adCreativeBaseSchema> & AdCreativeRelations)[]
  vidViewsGroups: (z.infer<typeof vidViewsGroupBaseSchema> & VidViewsGroupRelations)[]
  user: z.infer<typeof userBaseSchema> & UserRelations
}

export const fileRelationsSchema: z.ZodObject<{
  [K in keyof FileRelations]: z.ZodType<FileRelations[K]>
}> = z.object({
  artist: z.lazy(() => artistBaseSchema.merge(artistRelationsSchema)).nullable(),
  vidForTrack: z.lazy(() => trackBaseSchema.merge(trackRelationsSchema)).nullable(),
  masterMp3ForTrack: z.lazy(() => trackBaseSchema.merge(trackRelationsSchema)).nullable(),
  masterWavForTrack: z.lazy(() => trackBaseSchema.merge(trackRelationsSchema)).nullable(),
  playlists: z.lazy(() => playlistBaseSchema.merge(playlistRelationsSchema)).array(),
  playlistCoverRender: z.lazy(() => playlistCoverRenderBaseSchema.merge(playlistCoverRenderRelationsSchema)).nullable(),
  thumbnail: z.lazy(() => fileBaseSchema.merge(fileRelationsSchema)).nullable(),
  thumbnailFor: z.lazy(() => fileBaseSchema.merge(fileRelationsSchema)).nullable(),
  vidRender: z.lazy(() => vidRenderBaseSchema.merge(vidRenderRelationsSchema)).nullable(),
  parentVidForVidRenders: z.lazy(() => vidRenderBaseSchema.merge(vidRenderRelationsSchema)).array(),
  adCreatives: z.lazy(() => adCreativeBaseSchema.merge(adCreativeRelationsSchema)).array(),
  vidViewsGroups: z.lazy(() => vidViewsGroupBaseSchema.merge(vidViewsGroupRelationsSchema)).array(),
  user: z.lazy(() => userBaseSchema.merge(userRelationsSchema)),
})

export const fileSchema = fileBaseSchema
  .merge(fileRelationsSchema)

export const fileCreateSchema = fileBaseSchema
  .extend({
    description: fileBaseSchema.shape.description.unwrap(),
    artistId: fileBaseSchema.shape.artistId.unwrap(),
    width: fileBaseSchema.shape.width.unwrap(),
    height: fileBaseSchema.shape.height.unwrap(),
    fps: fileBaseSchema.shape.fps.unwrap(),
    duration: fileBaseSchema.shape.duration.unwrap(),
    metaId: fileBaseSchema.shape.metaId.unwrap(),
    vidForTrackId: fileBaseSchema.shape.vidForTrackId.unwrap(),
    thumbnailForId: fileBaseSchema.shape.thumbnailForId.unwrap(),
  }).partial({
    id: true,
    createdAt: true,
    description: true,
    artist: true,
    artistId: true,
    width: true,
    height: true,
    fps: true,
    duration: true,
    metaId: true,
    vidForTrack: true,
    vidForTrackId: true,
    masterMp3ForTrack: true,
    masterWavForTrack: true,
    playlists: true,
    playlistCoverRender: true,
    thumbnail: true,
    thumbnailFor: true,
    thumbnailForId: true,
    vidRender: true,
    parentVidForVidRenders: true,
    adCreatives: true,
    vidViewsGroups: true,
    userId: true,
  })

export const fileUpdateSchema = fileBaseSchema
  .extend({
    description: fileBaseSchema.shape.description.unwrap(),
    artistId: fileBaseSchema.shape.artistId.unwrap(),
    width: fileBaseSchema.shape.width.unwrap(),
    height: fileBaseSchema.shape.height.unwrap(),
    fps: fileBaseSchema.shape.fps.unwrap(),
    duration: fileBaseSchema.shape.duration.unwrap(),
    metaId: fileBaseSchema.shape.metaId.unwrap(),
    vidForTrackId: fileBaseSchema.shape.vidForTrackId.unwrap(),
    thumbnailForId: fileBaseSchema.shape.thumbnailForId.unwrap(),
  })
  .partial()
  
