import * as z from "zod"
import { FileRelations, fileRelationsSchema, fileBaseSchema } from "./file"
import { AdCampaignRelations, adCampaignRelationsSchema, adCampaignBaseSchema } from "./adcampaign"
import { UserRelations, userRelationsSchema, userBaseSchema } from "./user"
import { ArtistRelations, artistRelationsSchema, artistBaseSchema } from "./artist"

export const playlistCoverRenderBaseSchema = z.object({
  id: z.string(),
  name: z.string().nullable(),
  img: z.boolean(),
  imgSrc: z.string(),
  imgShift: z.boolean(),
  imgShiftX: z.number().int(),
  imgShiftY: z.number().int(),
  imgScale: z.number().int(),
  text: z.boolean(),
  textColor: z.string(),
  textScale: z.number().int(),
  textAlign: z.string(),
  textShiftX: z.number().int(),
  textShiftY: z.number().int(),
  logo: z.boolean(),
  logoColor: z.string(),
  renderedPlaylistCoverId: z.string().nullable(),
  userId: z.string(),
})

export interface PlaylistCoverRenderRelations {
  renderedPlaylistCover: (z.infer<typeof fileBaseSchema> & FileRelations) | null
  testForAdCampaigns: (z.infer<typeof adCampaignBaseSchema> & AdCampaignRelations)[]
  user: z.infer<typeof userBaseSchema> & UserRelations
  artists: (z.infer<typeof artistBaseSchema> & ArtistRelations)[]
}

export const playlistCoverRenderRelationsSchema: z.ZodObject<{
  [K in keyof PlaylistCoverRenderRelations]: z.ZodType<PlaylistCoverRenderRelations[K]>
}> = z.object({
  renderedPlaylistCover: z.lazy(() => fileBaseSchema.merge(fileRelationsSchema)).nullable(),
  testForAdCampaigns: z.lazy(() => adCampaignBaseSchema.merge(adCampaignRelationsSchema)).array(),
  user: z.lazy(() => userBaseSchema.merge(userRelationsSchema)),
  artists: z.lazy(() => artistBaseSchema.merge(artistRelationsSchema)).array(),
})

export const playlistCoverRenderSchema = playlistCoverRenderBaseSchema
  .merge(playlistCoverRenderRelationsSchema)

export const playlistCoverRenderCreateSchema = playlistCoverRenderBaseSchema
  .extend({
    name: playlistCoverRenderBaseSchema.shape.name.unwrap(),
    renderedPlaylistCoverId: playlistCoverRenderBaseSchema.shape.renderedPlaylistCoverId.unwrap(),
  }).partial({
    id: true,
    name: true,
    textColor: true,
    textScale: true,
    textAlign: true,
    textShiftX: true,
    textShiftY: true,
    logoColor: true,
    renderedPlaylistCover: true,
    renderedPlaylistCoverId: true,
    testForAdCampaigns: true,
    userId: true,
    artists: true,
  })

export const playlistCoverRenderUpdateSchema = playlistCoverRenderBaseSchema
  .extend({
    name: playlistCoverRenderBaseSchema.shape.name.unwrap(),
    renderedPlaylistCoverId: playlistCoverRenderBaseSchema.shape.renderedPlaylistCoverId.unwrap(),
  })
  .partial()
  
