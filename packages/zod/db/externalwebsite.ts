import * as z from "zod"
import { ArtistRelations, artistRelationsSchema, artistBaseSchema } from "./artist"
import { VisitorSessionRelations, visitorSessionRelationsSchema, visitorSessionBaseSchema } from "./visitorsession"

export const externalWebsiteBaseSchema = z.object({
  id: z.string(),
  createdAt: z.date(),
  name: z.string(),
  artistId: z.string(),
})

export interface ExternalWebsiteRelations {
  artist: z.infer<typeof artistBaseSchema> & ArtistRelations
  visitorSessions: (z.infer<typeof visitorSessionBaseSchema> & VisitorSessionRelations)[]
}

export const externalWebsiteRelationsSchema: z.ZodObject<{
  [K in keyof ExternalWebsiteRelations]: z.ZodType<ExternalWebsiteRelations[K]>
}> = z.object({
  artist: z.lazy(() => artistBaseSchema.merge(artistRelationsSchema)),
  visitorSessions: z.lazy(() => visitorSessionBaseSchema.merge(visitorSessionRelationsSchema)).array(),
})

export const externalWebsiteSchema = externalWebsiteBaseSchema
  .merge(externalWebsiteRelationsSchema)

export const externalWebsiteCreateSchema = externalWebsiteBaseSchema.partial({
  id: true,
  createdAt: true,
  artistId: true,
  visitorSessions: true,
})

export const externalWebsiteUpdateSchema = externalWebsiteBaseSchema
  .partial()
  
