import * as z from "zod"

export const postBaseSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
})

export const postSchema = postBaseSchema

export const postCreateSchema = postBaseSchema.partial({
  id: true,
})

export const postUpdateSchema = postBaseSchema
  .partial()
  
