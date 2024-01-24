import * as z from "zod"
import { InterestGroupRelations, interestGroupRelationsSchema, interestGroupBaseSchema } from "./interestgroup"

export const interestBaseSchema = z.object({
  id: z.string(),
  name: z.string(),
  metaId: z.string(),
  metaTopic: z.string(),
  metaAudienceLowerBound: z.number().int(),
  metaAudienceUpperBound: z.number().int(),
})

export interface InterestRelations {
  interestGroups: (z.infer<typeof interestGroupBaseSchema> & InterestGroupRelations)[]
}

export const interestRelationsSchema: z.ZodObject<{
  [K in keyof InterestRelations]: z.ZodType<InterestRelations[K]>
}> = z.object({
  interestGroups: z.lazy(() => interestGroupBaseSchema.merge(interestGroupRelationsSchema)).array(),
})

export const interestSchema = interestBaseSchema
  .merge(interestRelationsSchema)

export const interestCreateSchema = interestBaseSchema.partial({
  id: true,
  interestGroups: true,
})

export const interestUpdateSchema = interestBaseSchema
  .partial()
  
