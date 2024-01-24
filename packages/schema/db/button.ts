import * as z from "zod"
import { TeamRelations, teamRelationsSchema, teamBaseSchema } from "./team"
import { BioButtonRelations, bioButtonRelationsSchema, bioButtonBaseSchema } from "./biobutton"
import { LinkRelations, linkRelationsSchema, linkBaseSchema } from "./link"
import { FormRelations, formRelationsSchema, formBaseSchema } from "./form"

export const buttonBaseSchema = z.object({
  id: z.string(),
  teamId: z.string(),
  text: z.string().nullable(),
  buttonColor: z.string().nullable(),
  textColor: z.string().nullable(),
  linkId: z.string().nullable(),
  formId: z.string().nullable(),
  email: z.string().email().nullable(),
  phone: z.string().nullable(),
})

export interface ButtonRelations {
  team: z.infer<typeof teamBaseSchema> & TeamRelations
  bios: (z.infer<typeof bioButtonBaseSchema> & BioButtonRelations)[]
  link: (z.infer<typeof linkBaseSchema> & LinkRelations) | null
  form: (z.infer<typeof formBaseSchema> & FormRelations) | null
}

export const buttonRelationsSchema: z.ZodObject<{
  [K in keyof ButtonRelations]: z.ZodType<ButtonRelations[K]>
}> = z.object({
  team: z.lazy(() => teamBaseSchema.merge(teamRelationsSchema)),
  bios: z.lazy(() => bioButtonBaseSchema.merge(bioButtonRelationsSchema)).array(),
  link: z.lazy(() => linkBaseSchema.merge(linkRelationsSchema)).nullable(),
  form: z.lazy(() => formBaseSchema.merge(formRelationsSchema)).nullable(),
})

export const buttonSchema = buttonBaseSchema
  .merge(buttonRelationsSchema)

export const buttonCreateSchema = buttonBaseSchema
  .extend({
    text: buttonBaseSchema.shape.text.unwrap(),
    buttonColor: buttonBaseSchema.shape.buttonColor.unwrap(),
    textColor: buttonBaseSchema.shape.textColor.unwrap(),
    linkId: buttonBaseSchema.shape.linkId.unwrap(),
    formId: buttonBaseSchema.shape.formId.unwrap(),
    email: buttonBaseSchema.shape.email.unwrap(),
    phone: buttonBaseSchema.shape.phone.unwrap(),
  }).partial({
    id: true,
    teamId: true,
    text: true,
    buttonColor: true,
    textColor: true,
    bios: true,
    link: true,
    linkId: true,
    form: true,
    formId: true,
    email: true,
    phone: true,
  })

export const buttonUpdateSchema = buttonBaseSchema
  .extend({
    text: buttonBaseSchema.shape.text.unwrap(),
    buttonColor: buttonBaseSchema.shape.buttonColor.unwrap(),
    textColor: buttonBaseSchema.shape.textColor.unwrap(),
    linkId: buttonBaseSchema.shape.linkId.unwrap(),
    formId: buttonBaseSchema.shape.formId.unwrap(),
    email: buttonBaseSchema.shape.email.unwrap(),
    phone: buttonBaseSchema.shape.phone.unwrap(),
  })
  .partial()
  
