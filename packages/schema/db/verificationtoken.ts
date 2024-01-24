import * as z from "zod"

export const verificationTokenBaseSchema = z.object({
  identifier: z.string(),
  token: z.string(),
  expires: z.date(),
})

export const verificationTokenSchema = verificationTokenBaseSchema

export const verificationTokenCreateSchema = verificationTokenBaseSchema.partial({
})

export const verificationTokenUpdateSchema = verificationTokenBaseSchema
  .partial()
  
