import * as z from "zod"
import { eventTypeSchema } from "./eventtype"
import { LinkRelations, linkRelationsSchema, linkBaseSchema } from "./link"
import { BioRelations, bioRelationsSchema, bioBaseSchema } from "./bio"
import { BioButtonRelations, bioButtonRelationsSchema, bioButtonBaseSchema } from "./biobutton"
import { FormRelations, formRelationsSchema, formBaseSchema } from "./form"
import { VisitorSessionRelations, visitorSessionRelationsSchema, visitorSessionBaseSchema } from "./visitorsession"
import { EventReportRelations, eventReportRelationsSchema, eventReportBaseSchema } from "./eventreport"

export const eventBaseSchema = z.object({
  id: z.number().int(),
  type: eventTypeSchema,
  createdAt: z.date(),
  linkId: z.string().nullable(),
  bioId: z.string().nullable(),
  buttonId: z.string().nullable(),
  formId: z.string().nullable(),
  sessionId: z.string(),
})

export interface EventRelations {
  link: (z.infer<typeof linkBaseSchema> & LinkRelations) | null
  bio: (z.infer<typeof bioBaseSchema> & BioRelations) | null
  bioButton: (z.infer<typeof bioButtonBaseSchema> & BioButtonRelations) | null
  form: (z.infer<typeof formBaseSchema> & FormRelations) | null
  session: z.infer<typeof visitorSessionBaseSchema> & VisitorSessionRelations
  remarketingReports: (z.infer<typeof eventReportBaseSchema> & EventReportRelations)[]
}

export const eventRelationsSchema: z.ZodObject<{
  [K in keyof EventRelations]: z.ZodType<EventRelations[K]>
}> = z.object({
  link: z.lazy(() => linkBaseSchema.merge(linkRelationsSchema)).nullable(),
  bio: z.lazy(() => bioBaseSchema.merge(bioRelationsSchema)).nullable(),
  bioButton: z.lazy(() => bioButtonBaseSchema.merge(bioButtonRelationsSchema)).nullable(),
  form: z.lazy(() => formBaseSchema.merge(formRelationsSchema)).nullable(),
  session: z.lazy(() => visitorSessionBaseSchema.merge(visitorSessionRelationsSchema)),
  remarketingReports: z.lazy(() => eventReportBaseSchema.merge(eventReportRelationsSchema)).array(),
})

export const eventSchema = eventBaseSchema
  .merge(eventRelationsSchema)

export const eventCreateSchema = eventBaseSchema
  .extend({
    linkId: eventBaseSchema.shape.linkId.unwrap(),
    bioId: eventBaseSchema.shape.bioId.unwrap(),
    buttonId: eventBaseSchema.shape.buttonId.unwrap(),
    formId: eventBaseSchema.shape.formId.unwrap(),
  }).partial({
    id: true,
    createdAt: true,
    link: true,
    linkId: true,
    bio: true,
    bioId: true,
    bioButton: true,
    buttonId: true,
    form: true,
    formId: true,
    sessionId: true,
    remarketingReports: true,
  })

export const eventUpdateSchema = eventBaseSchema
  .extend({
    linkId: eventBaseSchema.shape.linkId.unwrap(),
    bioId: eventBaseSchema.shape.bioId.unwrap(),
    buttonId: eventBaseSchema.shape.buttonId.unwrap(),
    formId: eventBaseSchema.shape.formId.unwrap(),
  })
  .partial()
  
