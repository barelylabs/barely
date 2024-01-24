import * as z from "zod"
import { StoryRelations, storyRelationsSchema, storyBaseSchema } from "./story"
import { StoryColumnRelations, storyColumnRelationsSchema, storyColumnBaseSchema } from "./storycolumn"

export const storyUpdateBaseSchema = z.object({
  id: z.string(),
  createdAt: z.date(),
  storyId: z.string(),
  prevColumnId: z.string().nullable(),
  newColumnId: z.string().nullable(),
})

export interface StoryUpdateRelations {
  story: z.infer<typeof storyBaseSchema> & StoryRelations
  prevColumn: (z.infer<typeof storyColumnBaseSchema> & StoryColumnRelations) | null
  newColumn: (z.infer<typeof storyColumnBaseSchema> & StoryColumnRelations) | null
}

export const storyUpdateRelationsSchema: z.ZodObject<{
  [K in keyof StoryUpdateRelations]: z.ZodType<StoryUpdateRelations[K]>
}> = z.object({
  story: z.lazy(() => storyBaseSchema.merge(storyRelationsSchema)),
  prevColumn: z.lazy(() => storyColumnBaseSchema.merge(storyColumnRelationsSchema)).nullable(),
  newColumn: z.lazy(() => storyColumnBaseSchema.merge(storyColumnRelationsSchema)).nullable(),
})

export const storyUpdateSchema = storyUpdateBaseSchema
  .merge(storyUpdateRelationsSchema)

export const storyUpdateCreateSchema = storyUpdateBaseSchema
  .extend({
    prevColumnId: storyUpdateBaseSchema.shape.prevColumnId.unwrap(),
    newColumnId: storyUpdateBaseSchema.shape.newColumnId.unwrap(),
  }).partial({
    id: true,
    createdAt: true,
    storyId: true,
    prevColumn: true,
    prevColumnId: true,
    newColumn: true,
    newColumnId: true,
  })

export const storyUpdateUpdateSchema = storyUpdateBaseSchema
  .extend({
    prevColumnId: storyUpdateBaseSchema.shape.prevColumnId.unwrap(),
    newColumnId: storyUpdateBaseSchema.shape.newColumnId.unwrap(),
  })
  .partial()
  
