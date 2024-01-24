import * as z from "zod"
import { storyStageIdSchema } from "./storystageid"
import { StoryRelations, storyRelationsSchema, storyBaseSchema } from "./story"
import { StoryUpdateRecordRelations, storyUpdateRecordRelationsSchema, storyUpdateRecordBaseSchema } from "./storyupdaterecord"

export const storyStageBaseSchema = z.object({
  id: storyStageIdSchema,
  name: z.string(),
  color: z.string().nullable(),
})

export interface StoryStageRelations {
  stories: (z.infer<typeof storyBaseSchema> & StoryRelations)[]
  prevStoryFor: (z.infer<typeof storyUpdateRecordBaseSchema> & StoryUpdateRecordRelations)[]
  newStoryFor: (z.infer<typeof storyUpdateRecordBaseSchema> & StoryUpdateRecordRelations)[]
}

export const storyStageRelationsSchema: z.ZodObject<{
  [K in keyof StoryStageRelations]: z.ZodType<StoryStageRelations[K]>
}> = z.object({
  stories: z.lazy(() => storyBaseSchema.merge(storyRelationsSchema)).array(),
  prevStoryFor: z.lazy(() => storyUpdateRecordBaseSchema.merge(storyUpdateRecordRelationsSchema)).array(),
  newStoryFor: z.lazy(() => storyUpdateRecordBaseSchema.merge(storyUpdateRecordRelationsSchema)).array(),
})

export const storyStageSchema = storyStageBaseSchema
  .merge(storyStageRelationsSchema)

export const storyStageCreateSchema = storyStageBaseSchema
  .extend({
    color: storyStageBaseSchema.shape.color.unwrap(),
  }).partial({
    color: true,
    stories: true,
    prevStoryFor: true,
    newStoryFor: true,
  })

export const storyStageUpdateSchema = storyStageBaseSchema
  .extend({
    color: storyStageBaseSchema.shape.color.unwrap(),
  })
  .partial()
  
