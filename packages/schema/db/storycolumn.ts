import * as z from "zod"
import { StoryBoardRelations, storyBoardRelationsSchema, storyBoardBaseSchema } from "./storyboard"
import { StoryRelations, storyRelationsSchema, storyBaseSchema } from "./story"
import { StoryUpdateRecordRelations, storyUpdateRecordRelationsSchema, storyUpdateRecordBaseSchema } from "./storyupdaterecord"

export const storyColumnBaseSchema = z.object({
  id: z.string(),
  name: z.string(),
  boardId: z.string(),
  lexoRank: z.string(),
})

export interface StoryColumnRelations {
  board: z.infer<typeof storyBoardBaseSchema> & StoryBoardRelations
  stories: (z.infer<typeof storyBaseSchema> & StoryRelations)[]
  prevStoryFor: (z.infer<typeof storyUpdateRecordBaseSchema> & StoryUpdateRecordRelations)[]
  newStoryFor: (z.infer<typeof storyUpdateRecordBaseSchema> & StoryUpdateRecordRelations)[]
}

export const storyColumnRelationsSchema: z.ZodObject<{
  [K in keyof StoryColumnRelations]: z.ZodType<StoryColumnRelations[K]>
}> = z.object({
  board: z.lazy(() => storyBoardBaseSchema.merge(storyBoardRelationsSchema)),
  stories: z.lazy(() => storyBaseSchema.merge(storyRelationsSchema)).array(),
  prevStoryFor: z.lazy(() => storyUpdateRecordBaseSchema.merge(storyUpdateRecordRelationsSchema)).array(),
  newStoryFor: z.lazy(() => storyUpdateRecordBaseSchema.merge(storyUpdateRecordRelationsSchema)).array(),
})

export const storyColumnSchema = storyColumnBaseSchema
  .merge(storyColumnRelationsSchema)

export const storyColumnCreateSchema = storyColumnBaseSchema.partial({
  id: true,
  boardId: true,
  stories: true,
  prevStoryFor: true,
  newStoryFor: true,
})

export const storyColumnUpdateSchema = storyColumnBaseSchema
  .partial()
  
