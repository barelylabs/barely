import * as z from "zod"
import { UserRelations, userRelationsSchema, userBaseSchema } from "./user"

export const teamBaseSchema = z.object({
  id: z.string(),
  name: z.string(),
  createdAt: z.date(),
})

export interface TeamRelations {
  users: (z.infer<typeof userBaseSchema> & UserRelations)[]
}

export const teamRelationsSchema: z.ZodObject<{
  [K in keyof TeamRelations]: z.ZodType<TeamRelations[K]>
}> = z.object({
  users: z.lazy(() => userBaseSchema.merge(userRelationsSchema)).array(),
})

export const teamSchema = teamBaseSchema
  .merge(teamRelationsSchema)

export const teamCreateSchema = teamBaseSchema.partial({
  id: true,
  createdAt: true,
  users: true,
})

export const teamUpdateSchema = teamBaseSchema
  .partial()
  
