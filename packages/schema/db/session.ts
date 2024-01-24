import * as z from "zod"
import { UserRelations, userRelationsSchema, userBaseSchema } from "./user"

export const sessionBaseSchema = z.object({
  id: z.string(),
  userId: z.string(),
  sessionToken: z.string(),
  expires: z.date(),
})

export interface SessionRelations {
  user: z.infer<typeof userBaseSchema> & UserRelations
}

export const sessionRelationsSchema: z.ZodObject<{
  [K in keyof SessionRelations]: z.ZodType<SessionRelations[K]>
}> = z.object({
  user: z.lazy(() => userBaseSchema.merge(userRelationsSchema)),
})

export const sessionSchema = sessionBaseSchema
  .merge(sessionRelationsSchema)

export const sessionCreateSchema = sessionBaseSchema.partial({
  id: true,
  userId: true,
})

export const sessionUpdateSchema = sessionBaseSchema
  .partial()
  
