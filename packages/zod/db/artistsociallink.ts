import * as z from "zod"
import { appTypeSchema } from "./apptype"
import { ArtistRelations, artistRelationsSchema, artistBaseSchema } from "./artist"
import { LinkRelations, linkRelationsSchema, linkBaseSchema } from "./link"

export const artistSocialLinkBaseSchema = z.object({
  artistId: z.string(),
  linkApp: appTypeSchema,
  linkId: z.string(),
  display: z.boolean(),
})

export interface ArtistSocialLinkRelations {
  artist: z.infer<typeof artistBaseSchema> & ArtistRelations
  link: z.infer<typeof linkBaseSchema> & LinkRelations
}

export const artistSocialLinkRelationsSchema: z.ZodObject<{
  [K in keyof ArtistSocialLinkRelations]: z.ZodType<ArtistSocialLinkRelations[K]>
}> = z.object({
  artist: z.lazy(() => artistBaseSchema.merge(artistRelationsSchema)),
  link: z.lazy(() => linkBaseSchema.merge(linkRelationsSchema)),
})

export const artistSocialLinkSchema = artistSocialLinkBaseSchema
  .merge(artistSocialLinkRelationsSchema)

export const artistSocialLinkCreateSchema = artistSocialLinkBaseSchema.partial({
  artistId: true,
  linkApp: true,
  linkId: true,
  display: true,
})

export const artistSocialLinkUpdateSchema = artistSocialLinkBaseSchema
  .partial()
  
