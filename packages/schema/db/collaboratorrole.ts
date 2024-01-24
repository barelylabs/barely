import * as z from "zod"
import { collaboratorRoleOptionSchema } from "./collaboratorroleoption"
import { UserRelations, userRelationsSchema, userBaseSchema } from "./user"

export const collaboratorRoleBaseSchema = z.object({
  userId: z.string(),
  collaboratorId: z.string(),
  collaboratorRole: collaboratorRoleOptionSchema,
})

export interface CollaboratorRoleRelations {
  user: z.infer<typeof userBaseSchema> & UserRelations
  collaborator: z.infer<typeof userBaseSchema> & UserRelations
}

export const collaboratorRoleRelationsSchema: z.ZodObject<{
  [K in keyof CollaboratorRoleRelations]: z.ZodType<CollaboratorRoleRelations[K]>
}> = z.object({
  user: z.lazy(() => userBaseSchema.merge(userRelationsSchema)),
  collaborator: z.lazy(() => userBaseSchema.merge(userRelationsSchema)),
})

export const collaboratorRoleSchema = collaboratorRoleBaseSchema
  .merge(collaboratorRoleRelationsSchema)

export const collaboratorRoleCreateSchema = collaboratorRoleBaseSchema.partial({
  userId: true,
  collaboratorId: true,
})

export const collaboratorRoleUpdateSchema = collaboratorRoleBaseSchema
  .partial()
  
