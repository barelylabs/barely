import * as z from "zod"
import { UserRelations, userRelationsSchema, userBaseSchema } from "./user"

export const loginTokenBaseSchema = z.object({
  userId: z.string(),
  token: z.string(),
  expiresAt: z.date(),
})

export interface LoginTokenRelations {
  user: z.infer<typeof userBaseSchema> & UserRelations
}

export const loginTokenRelationsSchema: z.ZodObject<{
  [K in keyof LoginTokenRelations]: z.ZodType<LoginTokenRelations[K]>
}> = z.object({
  user: z.lazy(() => userBaseSchema.merge(userRelationsSchema)),
})

export const loginTokenSchema = loginTokenBaseSchema
  .merge(loginTokenRelationsSchema)

export const loginTokenCreateSchema = loginTokenBaseSchema.partial({
  userId: true,
})

export const loginTokenUpdateSchema = loginTokenBaseSchema
  .partial()
  
