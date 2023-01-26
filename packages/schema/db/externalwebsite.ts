import * as z from "zod"
import { UserRelations, userRelationsSchema, userBaseSchema } from "./user"
import { VisitorSessionRelations, visitorSessionRelationsSchema, visitorSessionBaseSchema } from "./visitorsession"

export const externalWebsiteBaseSchema = z.object({
  id: z.string(),
  createdAt: z.date(),
  name: z.string(),
  userId: z.string(),
  artistId: z.string().nullable(),
})

export interface ExternalWebsiteRelations {
  user: z.infer<typeof userBaseSchema> & UserRelations
  visitorSessions: (z.infer<typeof visitorSessionBaseSchema> & VisitorSessionRelations)[]
}

export const externalWebsiteRelationsSchema: z.ZodObject<{
  [K in keyof ExternalWebsiteRelations]: z.ZodType<ExternalWebsiteRelations[K]>
}> = z.object({
  user: z.lazy(() => userBaseSchema.merge(userRelationsSchema)),
  visitorSessions: z.lazy(() => visitorSessionBaseSchema.merge(visitorSessionRelationsSchema)).array(),
})

export const externalWebsiteSchema = externalWebsiteBaseSchema
  .merge(externalWebsiteRelationsSchema)

export const externalWebsiteCreateSchema = externalWebsiteBaseSchema
  .extend({
    artistId: externalWebsiteBaseSchema.shape.artistId.unwrap(),
  }).partial({
    id: true,
    createdAt: true,
    userId: true,
    artistId: true,
    visitorSessions: true,
  })

export const externalWebsiteUpdateSchema = externalWebsiteBaseSchema
  .extend({
    artistId: externalWebsiteBaseSchema.shape.artistId.unwrap(),
  })
  .partial()
  
