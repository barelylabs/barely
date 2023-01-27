import * as z from "zod"
import { UserRelations, userRelationsSchema, userBaseSchema } from "./user"
import { TeamRelations, teamRelationsSchema, teamBaseSchema } from "./team"
import { FileRelations, fileRelationsSchema, fileBaseSchema } from "./file"
import { PlaylistRelations, playlistRelationsSchema, playlistBaseSchema } from "./playlist"
import { AdCampaignRelations, adCampaignRelationsSchema, adCampaignBaseSchema } from "./adcampaign"

export const playlistCoverRenderBaseSchema = z.object({
  id: z.string(),
  name: z.string().nullable(),
  createdById: z.string(),
  teamId: z.string(),
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
  renderedCoverId: z.string().nullable(),
  playlistId: z.string(),
  renderedPlaylistCoverId: z.string().nullable(),
  userId: z.string().nullable(),
})

export interface PlaylistCoverRenderRelations {
  createdBy: z.infer<typeof userBaseSchema> & UserRelations
  team: z.infer<typeof teamBaseSchema> & TeamRelations
  renderedCover: (z.infer<typeof fileBaseSchema> & FileRelations) | null
  playlist: z.infer<typeof playlistBaseSchema> & PlaylistRelations
  adCampaigns: (z.infer<typeof adCampaignBaseSchema> & AdCampaignRelations)[]
}

export const playlistCoverRenderRelationsSchema: z.ZodObject<{
  [K in keyof PlaylistCoverRenderRelations]: z.ZodType<PlaylistCoverRenderRelations[K]>
}> = z.object({
  createdBy: z.lazy(() => userBaseSchema.merge(userRelationsSchema)),
  team: z.lazy(() => teamBaseSchema.merge(teamRelationsSchema)),
  renderedCover: z.lazy(() => fileBaseSchema.merge(fileRelationsSchema)).nullable(),
  playlist: z.lazy(() => playlistBaseSchema.merge(playlistRelationsSchema)),
  adCampaigns: z.lazy(() => adCampaignBaseSchema.merge(adCampaignRelationsSchema)).array(),
})

export const playlistCoverRenderSchema = playlistCoverRenderBaseSchema
  .merge(playlistCoverRenderRelationsSchema)

export const playlistCoverRenderCreateSchema = playlistCoverRenderBaseSchema
  .extend({
    name: playlistCoverRenderBaseSchema.shape.name.unwrap(),
    renderedCoverId: playlistCoverRenderBaseSchema.shape.renderedCoverId.unwrap(),
    renderedPlaylistCoverId: playlistCoverRenderBaseSchema.shape.renderedPlaylistCoverId.unwrap(),
    userId: playlistCoverRenderBaseSchema.shape.userId.unwrap(),
  }).partial({
    id: true,
    name: true,
    createdById: true,
    teamId: true,
    textColor: true,
    textScale: true,
    textAlign: true,
    textShiftX: true,
    textShiftY: true,
    logoColor: true,
    renderedCover: true,
    renderedCoverId: true,
    playlistId: true,
    adCampaigns: true,
    renderedPlaylistCoverId: true,
    userId: true,
  })

export const playlistCoverRenderUpdateSchema = playlistCoverRenderBaseSchema
  .extend({
    name: playlistCoverRenderBaseSchema.shape.name.unwrap(),
    renderedCoverId: playlistCoverRenderBaseSchema.shape.renderedCoverId.unwrap(),
    renderedPlaylistCoverId: playlistCoverRenderBaseSchema.shape.renderedPlaylistCoverId.unwrap(),
    userId: playlistCoverRenderBaseSchema.shape.userId.unwrap(),
  })
  .partial()
  
