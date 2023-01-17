import * as z from "zod"
import { adPlatformSchema } from "./adplatform"
import { ArtistRelations, artistRelationsSchema, artistBaseSchema } from "./artist"
import { RemarketingRelations, remarketingRelationsSchema, remarketingBaseSchema } from "./remarketing"

export const artistRemarketingBaseSchema = z.object({
  artistId: z.string(),
  remarketingId: z.string(),
  remarketingPlatform: adPlatformSchema,
})

export interface ArtistRemarketingRelations {
  artist: z.infer<typeof artistBaseSchema> & ArtistRelations
  remarketing: z.infer<typeof remarketingBaseSchema> & RemarketingRelations
}

export const artistRemarketingRelationsSchema: z.ZodObject<{
  [K in keyof ArtistRemarketingRelations]: z.ZodType<ArtistRemarketingRelations[K]>
}> = z.object({
  artist: z.lazy(() => artistBaseSchema.merge(artistRelationsSchema)),
  remarketing: z.lazy(() => remarketingBaseSchema.merge(remarketingRelationsSchema)),
})

export const artistRemarketingSchema = artistRemarketingBaseSchema
  .merge(artistRemarketingRelationsSchema)

export const artistRemarketingCreateSchema = artistRemarketingBaseSchema.partial({
  artistId: true,
  remarketingId: true,
  remarketingPlatform: true,
})

export const artistRemarketingUpdateSchema = artistRemarketingBaseSchema
  .partial()
  
