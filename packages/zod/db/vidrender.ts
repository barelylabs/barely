import * as z from "zod"
import { renderStatusSchema } from "./renderstatus"
import { FileRelations, fileRelationsSchema, fileBaseSchema } from "./file"
import { TrackRenderRelations, trackRenderRelationsSchema, trackRenderBaseSchema } from "./trackrender"
import { AdCampaignRelations, adCampaignRelationsSchema, adCampaignBaseSchema } from "./adcampaign"
import { UserRelations, userRelationsSchema, userBaseSchema } from "./user"
import { ArtistRelations, artistRelationsSchema, artistBaseSchema } from "./artist"

export const vidRenderBaseSchema = z.object({
  id: z.string(),
  renderStatus: renderStatusSchema,
  renderFailedError: z.string().nullable(),
  renderedVidId: z.string(),
  parentVidId: z.string(),
  compName: z.string(),
  compWidth: z.number().int(),
  compHeight: z.number().int(),
  compDuration: z.number().int(),
  trim: z.boolean(),
  trimIn: z.number(),
  trimOut: z.number(),
  shift: z.boolean(),
  shiftX: z.number().int(),
  shiftY: z.number().int(),
  playbackSpeed: z.number(),
  addTrack: z.boolean(),
  trackRenderId: z.string(),
  addPlaylistTitle: z.boolean(),
  playlistTitle: z.string().nullable(),
  lambdaRenderId: z.string(),
  lambdaBucket: z.string(),
  lambdaFunction: z.string(),
  lambdaRegion: z.string(),
  userId: z.string(),
})

export interface VidRenderRelations {
  renderedVid: z.infer<typeof fileBaseSchema> & FileRelations
  parentVid: z.infer<typeof fileBaseSchema> & FileRelations
  trackRender: z.infer<typeof trackRenderBaseSchema> & TrackRenderRelations
  adCampaigns: (z.infer<typeof adCampaignBaseSchema> & AdCampaignRelations)[]
  user: z.infer<typeof userBaseSchema> & UserRelations
  artists: (z.infer<typeof artistBaseSchema> & ArtistRelations)[]
}

export const vidRenderRelationsSchema: z.ZodObject<{
  [K in keyof VidRenderRelations]: z.ZodType<VidRenderRelations[K]>
}> = z.object({
  renderedVid: z.lazy(() => fileBaseSchema.merge(fileRelationsSchema)),
  parentVid: z.lazy(() => fileBaseSchema.merge(fileRelationsSchema)),
  trackRender: z.lazy(() => trackRenderBaseSchema.merge(trackRenderRelationsSchema)),
  adCampaigns: z.lazy(() => adCampaignBaseSchema.merge(adCampaignRelationsSchema)).array(),
  user: z.lazy(() => userBaseSchema.merge(userRelationsSchema)),
  artists: z.lazy(() => artistBaseSchema.merge(artistRelationsSchema)).array(),
})

export const vidRenderSchema = vidRenderBaseSchema
  .merge(vidRenderRelationsSchema)

export const vidRenderCreateSchema = vidRenderBaseSchema
  .extend({
    renderFailedError: vidRenderBaseSchema.shape.renderFailedError.unwrap(),
    playlistTitle: vidRenderBaseSchema.shape.playlistTitle.unwrap(),
  }).partial({
    id: true,
    renderFailedError: true,
    renderedVidId: true,
    parentVidId: true,
    trackRenderId: true,
    playlistTitle: true,
    adCampaigns: true,
    userId: true,
    artists: true,
  })

export const vidRenderUpdateSchema = vidRenderBaseSchema
  .extend({
    renderFailedError: vidRenderBaseSchema.shape.renderFailedError.unwrap(),
    playlistTitle: vidRenderBaseSchema.shape.playlistTitle.unwrap(),
  })
  .partial()
  
