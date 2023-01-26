import * as z from "zod"
import { renderStatusSchema } from "./renderstatus"
import { FileRelations, fileRelationsSchema, fileBaseSchema } from "./file"
import { TrackRenderRelations, trackRenderRelationsSchema, trackRenderBaseSchema } from "./trackrender"
import { AdCampaignRelations, adCampaignRelationsSchema, adCampaignBaseSchema } from "./adcampaign"

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
  adCampaignId: z.string().nullable(),
})

export interface VidRenderRelations {
  renderedVid: z.infer<typeof fileBaseSchema> & FileRelations
  parentVid: z.infer<typeof fileBaseSchema> & FileRelations
  trackRender: z.infer<typeof trackRenderBaseSchema> & TrackRenderRelations
  adCampaign: (z.infer<typeof adCampaignBaseSchema> & AdCampaignRelations) | null
}

export const vidRenderRelationsSchema: z.ZodObject<{
  [K in keyof VidRenderRelations]: z.ZodType<VidRenderRelations[K]>
}> = z.object({
  renderedVid: z.lazy(() => fileBaseSchema.merge(fileRelationsSchema)),
  parentVid: z.lazy(() => fileBaseSchema.merge(fileRelationsSchema)),
  trackRender: z.lazy(() => trackRenderBaseSchema.merge(trackRenderRelationsSchema)),
  adCampaign: z.lazy(() => adCampaignBaseSchema.merge(adCampaignRelationsSchema)).nullable(),
})

export const vidRenderSchema = vidRenderBaseSchema
  .merge(vidRenderRelationsSchema)

export const vidRenderCreateSchema = vidRenderBaseSchema
  .extend({
    renderFailedError: vidRenderBaseSchema.shape.renderFailedError.unwrap(),
    playlistTitle: vidRenderBaseSchema.shape.playlistTitle.unwrap(),
    adCampaignId: vidRenderBaseSchema.shape.adCampaignId.unwrap(),
  }).partial({
    id: true,
    renderFailedError: true,
    renderedVidId: true,
    parentVidId: true,
    trackRenderId: true,
    playlistTitle: true,
    adCampaign: true,
    adCampaignId: true,
  })

export const vidRenderUpdateSchema = vidRenderBaseSchema
  .extend({
    renderFailedError: vidRenderBaseSchema.shape.renderFailedError.unwrap(),
    playlistTitle: vidRenderBaseSchema.shape.playlistTitle.unwrap(),
    adCampaignId: vidRenderBaseSchema.shape.adCampaignId.unwrap(),
  })
  .partial()
  
