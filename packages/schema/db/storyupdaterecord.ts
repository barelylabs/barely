import * as z from "zod"
import { StoryRelations, storyRelationsSchema, storyBaseSchema } from "./story"
import { StoryColumnRelations, storyColumnRelationsSchema, storyColumnBaseSchema } from "./storycolumn"

export const storyUpdateRecordBaseSchema = z.object({
  id: z.string(),
  createdAt: z.date(),
  storyId: z.string(),
  prevColumnId: z.string().nullable(),
  newColumnId: z.string().nullable(),
})

export interface StoryUpdateRecordRelations {
  story: z.infer<typeof storyBaseSchema> & StoryRelations
  prevColumn: (z.infer<typeof storyColumnBaseSchema> & StoryColumnRelations) | null
  newColumn: (z.infer<typeof storyColumnBaseSchema> & StoryColumnRelations) | null
}

export const storyUpdateRecordRelationsSchema: z.ZodObject<{
  [K in keyof StoryUpdateRecordRelations]: z.ZodType<StoryUpdateRecordRelations[K]>
}> = z.object({
  story: z.lazy(() => storyBaseSchema.merge(storyRelationsSchema)),
  prevColumn: z.lazy(() => storyColumnBaseSchema.merge(storyColumnRelationsSchema)).nullable(),
  newColumn: z.lazy(() => storyColumnBaseSchema.merge(storyColumnRelationsSchema)).nullable(),
})

export const storyUpdateRecordSchema = storyUpdateRecordBaseSchema
  .merge(storyUpdateRecordRelationsSchema)

export const storyUpdateRecordCreateSchema = storyUpdateRecordBaseSchema
  .extend({
    prevColumnId: storyUpdateRecordBaseSchema.shape.prevColumnId.unwrap(),
    newColumnId: storyUpdateRecordBaseSchema.shape.newColumnId.unwrap(),
  }).partial({
    id: true,
    createdAt: true,
    storyId: true,
    prevColumn: true,
    prevColumnId: true,
    newColumn: true,
    newColumnId: true,
  })

export const storyUpdateRecordUpdateSchema = storyUpdateRecordBaseSchema
  .extend({
    prevColumnId: storyUpdateRecordBaseSchema.shape.prevColumnId.unwrap(),
    newColumnId: storyUpdateRecordBaseSchema.shape.newColumnId.unwrap(),
  })
  .partial()
  
