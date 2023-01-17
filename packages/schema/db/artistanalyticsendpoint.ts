import * as z from "zod"
import { analyticsPlatformSchema } from "./analyticsplatform"
import { ArtistRelations, artistRelationsSchema, artistBaseSchema } from "./artist"
import { AnalyticsEndpointRelations, analyticsEndpointRelationsSchema, analyticsEndpointBaseSchema } from "./analyticsendpoint"

export const artistAnalyticsEndpointBaseSchema = z.object({
  artistId: z.string(),
  analyticsId: z.string(),
  analyticsPlatform: analyticsPlatformSchema,
})

export interface ArtistAnalyticsEndpointRelations {
  artist: z.infer<typeof artistBaseSchema> & ArtistRelations
  analyticsEndpoint: z.infer<typeof analyticsEndpointBaseSchema> & AnalyticsEndpointRelations
}

export const artistAnalyticsEndpointRelationsSchema: z.ZodObject<{
  [K in keyof ArtistAnalyticsEndpointRelations]: z.ZodType<ArtistAnalyticsEndpointRelations[K]>
}> = z.object({
  artist: z.lazy(() => artistBaseSchema.merge(artistRelationsSchema)),
  analyticsEndpoint: z.lazy(() => analyticsEndpointBaseSchema.merge(analyticsEndpointRelationsSchema)),
})

export const artistAnalyticsEndpointSchema = artistAnalyticsEndpointBaseSchema
  .merge(artistAnalyticsEndpointRelationsSchema)

export const artistAnalyticsEndpointCreateSchema = artistAnalyticsEndpointBaseSchema.partial({
  artistId: true,
  analyticsId: true,
  analyticsPlatform: true,
})

export const artistAnalyticsEndpointUpdateSchema = artistAnalyticsEndpointBaseSchema
  .partial()
  
