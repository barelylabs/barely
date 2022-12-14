import * as z from "zod"
import { BioRelations, bioRelationsSchema, bioBaseSchema } from "./bio"
import { ButtonRelations, buttonRelationsSchema, buttonBaseSchema } from "./button"
import { EventRelations, eventRelationsSchema, eventBaseSchema } from "./event"

export const bioButtonBaseSchema = z.object({
  bioId: z.string(),
  buttonId: z.string(),
  buttonLexoRank: z.string(),
})

export interface BioButtonRelations {
  bio: z.infer<typeof bioBaseSchema> & BioRelations
  button: z.infer<typeof buttonBaseSchema> & ButtonRelations
  events: (z.infer<typeof eventBaseSchema> & EventRelations)[]
}

export const bioButtonRelationsSchema: z.ZodObject<{
  [K in keyof BioButtonRelations]: z.ZodType<BioButtonRelations[K]>
}> = z.object({
  bio: z.lazy(() => bioBaseSchema.merge(bioRelationsSchema)),
  button: z.lazy(() => buttonBaseSchema.merge(buttonRelationsSchema)),
  events: z.lazy(() => eventBaseSchema.merge(eventRelationsSchema)).array(),
})

export const bioButtonSchema = bioButtonBaseSchema
  .merge(bioButtonRelationsSchema)

export const bioButtonCreateSchema = bioButtonBaseSchema.partial({
  bioId: true,
  buttonId: true,
  events: true,
})

export const bioButtonUpdateSchema = bioButtonBaseSchema
  .partial()
  
