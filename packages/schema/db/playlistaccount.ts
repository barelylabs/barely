import * as z from "zod"
import { PlaylistRelations, playlistRelationsSchema, playlistBaseSchema } from "./playlist"
import { AccountRelations, accountRelationsSchema, accountBaseSchema } from "./account"

export const playlistAccountBaseSchema = z.object({
  playlistId: z.string(),
  accountId: z.string(),
})

export interface PlaylistAccountRelations {
  playlist: z.infer<typeof playlistBaseSchema> & PlaylistRelations
  account: z.infer<typeof accountBaseSchema> & AccountRelations
}

export const playlistAccountRelationsSchema: z.ZodObject<{
  [K in keyof PlaylistAccountRelations]: z.ZodType<PlaylistAccountRelations[K]>
}> = z.object({
  playlist: z.lazy(() => playlistBaseSchema.merge(playlistRelationsSchema)),
  account: z.lazy(() => accountBaseSchema.merge(accountRelationsSchema)),
})

export const playlistAccountSchema = playlistAccountBaseSchema
  .merge(playlistAccountRelationsSchema)

export const playlistAccountCreateSchema = playlistAccountBaseSchema.partial({
  playlistId: true,
  accountId: true,
})

export const playlistAccountUpdateSchema = playlistAccountBaseSchema
  .partial()
  
