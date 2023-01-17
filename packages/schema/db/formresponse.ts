import * as z from "zod"
import { FormRelations, formRelationsSchema, formBaseSchema } from "./form"

export const formResponseBaseSchema = z.object({
  id: z.string(),
  createdAt: z.date(),
  formId: z.string(),
  name: z.string().nullable(),
  email: z.string().email().nullable(),
  phone: z.string().nullable(),
  message: z.string().nullable(),
})

export interface FormResponseRelations {
  form: z.infer<typeof formBaseSchema> & FormRelations
}

export const formResponseRelationsSchema: z.ZodObject<{
  [K in keyof FormResponseRelations]: z.ZodType<FormResponseRelations[K]>
}> = z.object({
  form: z.lazy(() => formBaseSchema.merge(formRelationsSchema)),
})

export const formResponseSchema = formResponseBaseSchema
  .merge(formResponseRelationsSchema)

export const formResponseCreateSchema = formResponseBaseSchema
  .extend({
    name: formResponseBaseSchema.shape.name.unwrap(),
    email: formResponseBaseSchema.shape.email.unwrap(),
    phone: formResponseBaseSchema.shape.phone.unwrap(),
    message: formResponseBaseSchema.shape.message.unwrap(),
  }).partial({
    id: true,
    createdAt: true,
    formId: true,
    name: true,
    email: true,
    phone: true,
    message: true,
  })

export const formResponseUpdateSchema = formResponseBaseSchema
  .extend({
    name: formResponseBaseSchema.shape.name.unwrap(),
    email: formResponseBaseSchema.shape.email.unwrap(),
    phone: formResponseBaseSchema.shape.phone.unwrap(),
    message: formResponseBaseSchema.shape.message.unwrap(),
  })
  .partial()
  
