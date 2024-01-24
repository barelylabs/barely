import * as z from "zod"
import { countryColorCodeSchema } from "./countrycolorcode"
import { GeoGroupRelations, geoGroupRelationsSchema, geoGroupBaseSchema } from "./geogroup"

export const countryBaseSchema = z.object({
  id: z.string(),
  name: z.string(),
  code: z.string(),
  color: countryColorCodeSchema,
  trigger: z.boolean(),
  metaAudienceLowerBound: z.number().int().nullable(),
  metaAudienceUpperBound: z.number().int().nullable(),
})

export interface CountryRelations {
  geoGroups: (z.infer<typeof geoGroupBaseSchema> & GeoGroupRelations)[]
}

export const countryRelationsSchema: z.ZodObject<{
  [K in keyof CountryRelations]: z.ZodType<CountryRelations[K]>
}> = z.object({
  geoGroups: z.lazy(() => geoGroupBaseSchema.merge(geoGroupRelationsSchema)).array(),
})

export const countrySchema = countryBaseSchema
  .merge(countryRelationsSchema)

export const countryCreateSchema = countryBaseSchema
  .extend({
    metaAudienceLowerBound: countryBaseSchema.shape.metaAudienceLowerBound.unwrap(),
    metaAudienceUpperBound: countryBaseSchema.shape.metaAudienceUpperBound.unwrap(),
  }).partial({
    metaAudienceLowerBound: true,
    metaAudienceUpperBound: true,
    geoGroups: true,
  })

export const countryUpdateSchema = countryBaseSchema
  .extend({
    metaAudienceLowerBound: countryBaseSchema.shape.metaAudienceLowerBound.unwrap(),
    metaAudienceUpperBound: countryBaseSchema.shape.metaAudienceUpperBound.unwrap(),
  })
  .partial()
  
