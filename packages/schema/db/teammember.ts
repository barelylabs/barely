import * as z from "zod"
import { teamRoleOptionSchema } from "./teamroleoption"
import { UserRelations, userRelationsSchema, userBaseSchema } from "./user"
import { TeamRelations, teamRelationsSchema, teamBaseSchema } from "./team"

export const teamMemberBaseSchema = z.object({
  userId: z.string(),
  teamId: z.string(),
  role: teamRoleOptionSchema,
})

export interface TeamMemberRelations {
  user: z.infer<typeof userBaseSchema> & UserRelations
  team: z.infer<typeof teamBaseSchema> & TeamRelations
}

export const teamMemberRelationsSchema: z.ZodObject<{
  [K in keyof TeamMemberRelations]: z.ZodType<TeamMemberRelations[K]>
}> = z.object({
  user: z.lazy(() => userBaseSchema.merge(userRelationsSchema)),
  team: z.lazy(() => teamBaseSchema.merge(teamRelationsSchema)),
})

export const teamMemberSchema = teamMemberBaseSchema
  .merge(teamMemberRelationsSchema)

export const teamMemberCreateSchema = teamMemberBaseSchema.partial({
  userId: true,
  teamId: true,
  role: true,
})

export const teamMemberUpdateSchema = teamMemberBaseSchema
  .partial()
  
