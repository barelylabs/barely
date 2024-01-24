import * as z from "zod"
import { OrganizationMemberRelations, organizationMemberRelationsSchema, organizationMemberBaseSchema } from "./organizationmember"

export const organizationBaseSchema = z.object({
  id: z.string(),
  name: z.string(),
  createdAt: z.date(),
})

export interface OrganizationRelations {
  users: (z.infer<typeof organizationMemberBaseSchema> & OrganizationMemberRelations)[]
}

export const organizationRelationsSchema: z.ZodObject<{
  [K in keyof OrganizationRelations]: z.ZodType<OrganizationRelations[K]>
}> = z.object({
  users: z.lazy(() => organizationMemberBaseSchema.merge(organizationMemberRelationsSchema)).array(),
})

export const organizationSchema = organizationBaseSchema
  .merge(organizationRelationsSchema)

export const organizationCreateSchema = organizationBaseSchema.partial({
  id: true,
  createdAt: true,
  users: true,
})

export const organizationUpdateSchema = organizationBaseSchema
  .partial()
  
