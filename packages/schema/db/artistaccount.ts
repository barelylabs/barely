import * as z from "zod"
import { accountTypeSchema } from "./accounttype"
import { ArtistRelations, artistRelationsSchema, artistBaseSchema } from "./artist"
import { AccountRelations, accountRelationsSchema, accountBaseSchema } from "./account"
import { StatRelations, statRelationsSchema, statBaseSchema } from "./stat"

export const artistAccountBaseSchema = z.object({
  artistId: z.string(),
  accountId: z.string(),
  accountType: accountTypeSchema,
})

export interface ArtistAccountRelations {
  artist: z.infer<typeof artistBaseSchema> & ArtistRelations
  account: z.infer<typeof accountBaseSchema> & AccountRelations
  stats: (z.infer<typeof statBaseSchema> & StatRelations)[]
}

export const artistAccountRelationsSchema: z.ZodObject<{
  [K in keyof ArtistAccountRelations]: z.ZodType<ArtistAccountRelations[K]>
}> = z.object({
  artist: z.lazy(() => artistBaseSchema.merge(artistRelationsSchema)),
  account: z.lazy(() => accountBaseSchema.merge(accountRelationsSchema)),
  stats: z.lazy(() => statBaseSchema.merge(statRelationsSchema)).array(),
})

export const artistAccountSchema = artistAccountBaseSchema
  .merge(artistAccountRelationsSchema)

export const artistAccountCreateSchema = artistAccountBaseSchema.partial({
  artistId: true,
  accountId: true,
  accountType: true,
  stats: true,
})

export const artistAccountUpdateSchema = artistAccountBaseSchema
  .partial()
  
