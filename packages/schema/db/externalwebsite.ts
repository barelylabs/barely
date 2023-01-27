import * as z from "zod"
import { TeamRelations, teamRelationsSchema, teamBaseSchema } from "./team"
import { VisitorSessionRelations, visitorSessionRelationsSchema, visitorSessionBaseSchema } from "./visitorsession"

export const externalWebsiteBaseSchema = z.object({
  id: z.string(),
  createdAt: z.date(),
  name: z.string(),
  teamId: z.string().nullable(),
})

export interface ExternalWebsiteRelations {
  team: (z.infer<typeof teamBaseSchema> & TeamRelations) | null
  visitorSessions: (z.infer<typeof visitorSessionBaseSchema> & VisitorSessionRelations)[]
}

export const externalWebsiteRelationsSchema: z.ZodObject<{
  [K in keyof ExternalWebsiteRelations]: z.ZodType<ExternalWebsiteRelations[K]>
}> = z.object({
  team: z.lazy(() => teamBaseSchema.merge(teamRelationsSchema)).nullable(),
  visitorSessions: z.lazy(() => visitorSessionBaseSchema.merge(visitorSessionRelationsSchema)).array(),
})

export const externalWebsiteSchema = externalWebsiteBaseSchema
  .merge(externalWebsiteRelationsSchema)

export const externalWebsiteCreateSchema = externalWebsiteBaseSchema
  .extend({
    teamId: externalWebsiteBaseSchema.shape.teamId.unwrap(),
  }).partial({
    id: true,
    createdAt: true,
    team: true,
    teamId: true,
    visitorSessions: true,
  })

export const externalWebsiteUpdateSchema = externalWebsiteBaseSchema
  .extend({
    teamId: externalWebsiteBaseSchema.shape.teamId.unwrap(),
  })
  .partial()
  
