import * as z from "zod"
import { appTypeSchema } from "./apptype"
import { TrackRelations, trackRelationsSchema, trackBaseSchema } from "./track"
import { LinkRelations, linkRelationsSchema, linkBaseSchema } from "./link"

export const trackAppLinkBaseSchema = z.object({
  trackId: z.string(),
  linkApp: appTypeSchema,
  linkId: z.string(),
})

export interface TrackAppLinkRelations {
  track: z.infer<typeof trackBaseSchema> & TrackRelations
  link: z.infer<typeof linkBaseSchema> & LinkRelations
}

export const trackAppLinkRelationsSchema: z.ZodObject<{
  [K in keyof TrackAppLinkRelations]: z.ZodType<TrackAppLinkRelations[K]>
}> = z.object({
  track: z.lazy(() => trackBaseSchema.merge(trackRelationsSchema)),
  link: z.lazy(() => linkBaseSchema.merge(linkRelationsSchema)),
})

export const trackAppLinkSchema = trackAppLinkBaseSchema
  .merge(trackAppLinkRelationsSchema)

export const trackAppLinkCreateSchema = trackAppLinkBaseSchema.partial({
  trackId: true,
  linkApp: true,
  linkId: true,
})

export const trackAppLinkUpdateSchema = trackAppLinkBaseSchema
  .partial()
  
