import * as z from "zod"
import { PitchReviewRelations, pitchReviewRelationsSchema, pitchReviewBaseSchema } from "./pitchreview"
import { PlaylistRelations, playlistRelationsSchema, playlistBaseSchema } from "./playlist"

export const placementBaseSchema = z.object({
  id: z.string(),
  createdAt: z.date(),
  pitchReviewId: z.string(),
  addToPlaylist: z.boolean().nullable(),
  addedToPlaylist: z.boolean().nullable(),
  playlistId: z.string().nullable(),
  playlistPosition: z.number().int().nullable(),
  addDate: z.date().nullable(),
  daysInPlaylist: z.number().int().nullable(),
  removeDate: z.date().nullable(),
})

export interface PlacementRelations {
  pitchReview: z.infer<typeof pitchReviewBaseSchema> & PitchReviewRelations
  playlist: (z.infer<typeof playlistBaseSchema> & PlaylistRelations) | null
}

export const placementRelationsSchema: z.ZodObject<{
  [K in keyof PlacementRelations]: z.ZodType<PlacementRelations[K]>
}> = z.object({
  pitchReview: z.lazy(() => pitchReviewBaseSchema.merge(pitchReviewRelationsSchema)),
  playlist: z.lazy(() => playlistBaseSchema.merge(playlistRelationsSchema)).nullable(),
})

export const placementSchema = placementBaseSchema
  .merge(placementRelationsSchema)

export const placementCreateSchema = placementBaseSchema
  .extend({
    addToPlaylist: placementBaseSchema.shape.addToPlaylist.unwrap(),
    addedToPlaylist: placementBaseSchema.shape.addedToPlaylist.unwrap(),
    playlistId: placementBaseSchema.shape.playlistId.unwrap(),
    playlistPosition: placementBaseSchema.shape.playlistPosition.unwrap(),
    addDate: placementBaseSchema.shape.addDate.unwrap(),
    daysInPlaylist: placementBaseSchema.shape.daysInPlaylist.unwrap(),
    removeDate: placementBaseSchema.shape.removeDate.unwrap(),
  }).partial({
    id: true,
    createdAt: true,
    pitchReviewId: true,
    addToPlaylist: true,
    addedToPlaylist: true,
    playlist: true,
    playlistId: true,
    playlistPosition: true,
    addDate: true,
    daysInPlaylist: true,
    removeDate: true,
  })

export const placementUpdateSchema = placementBaseSchema
  .extend({
    addToPlaylist: placementBaseSchema.shape.addToPlaylist.unwrap(),
    addedToPlaylist: placementBaseSchema.shape.addedToPlaylist.unwrap(),
    playlistId: placementBaseSchema.shape.playlistId.unwrap(),
    playlistPosition: placementBaseSchema.shape.playlistPosition.unwrap(),
    addDate: placementBaseSchema.shape.addDate.unwrap(),
    daysInPlaylist: placementBaseSchema.shape.daysInPlaylist.unwrap(),
    removeDate: placementBaseSchema.shape.removeDate.unwrap(),
  })
  .partial()
  
