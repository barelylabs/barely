import * as z from "zod"
import { artistUserRoleOptionSchema } from "./artistuserroleoption"
import { UserRelations, userRelationsSchema, userBaseSchema } from "./user"
import { ArtistRelations, artistRelationsSchema, artistBaseSchema } from "./artist"

export const artistUserRoleBaseSchema = z.object({
  userId: z.string(),
  artistId: z.string(),
  role: artistUserRoleOptionSchema,
})

export interface ArtistUserRoleRelations {
  user: z.infer<typeof userBaseSchema> & UserRelations
  artist: z.infer<typeof artistBaseSchema> & ArtistRelations
}

export const artistUserRoleRelationsSchema: z.ZodObject<{
  [K in keyof ArtistUserRoleRelations]: z.ZodType<ArtistUserRoleRelations[K]>
}> = z.object({
  user: z.lazy(() => userBaseSchema.merge(userRelationsSchema)),
  artist: z.lazy(() => artistBaseSchema.merge(artistRelationsSchema)),
})

export const artistUserRoleSchema = artistUserRoleBaseSchema
  .merge(artistUserRoleRelationsSchema)

export const artistUserRoleCreateSchema = artistUserRoleBaseSchema.partial({
  userId: true,
  artistId: true,
})

export const artistUserRoleUpdateSchema = artistUserRoleBaseSchema
  .partial()
  
