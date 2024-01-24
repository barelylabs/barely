import * as z from "zod"
import { organizationRoleOptionSchema } from "./organizationroleoption"
import { UserRelations, userRelationsSchema, userBaseSchema } from "./user"
import { OrganizationRelations, organizationRelationsSchema, organizationBaseSchema } from "./organization"

export const organizationMemberBaseSchema = z.object({
  userId: z.string(),
  orgId: z.string(),
  role: organizationRoleOptionSchema,
})

export interface OrganizationMemberRelations {
  user: z.infer<typeof userBaseSchema> & UserRelations
  org: z.infer<typeof organizationBaseSchema> & OrganizationRelations
}

export const organizationMemberRelationsSchema: z.ZodObject<{
  [K in keyof OrganizationMemberRelations]: z.ZodType<OrganizationMemberRelations[K]>
}> = z.object({
  user: z.lazy(() => userBaseSchema.merge(userRelationsSchema)),
  org: z.lazy(() => organizationBaseSchema.merge(organizationRelationsSchema)),
})

export const organizationMemberSchema = organizationMemberBaseSchema
  .merge(organizationMemberRelationsSchema)

export const organizationMemberCreateSchema = organizationMemberBaseSchema.partial({
  userId: true,
  orgId: true,
  role: true,
})

export const organizationMemberUpdateSchema = organizationMemberBaseSchema
  .partial()
  
