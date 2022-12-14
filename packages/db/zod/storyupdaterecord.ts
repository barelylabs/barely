import * as z from "zod"
import { storyStageIdSchema } from "./storystageid"
import { StoryRelations, storyRelationsSchema, storyBaseSchema } from "./story"
import { StoryStageRelations, storyStageRelationsSchema, storyStageBaseSchema } from "./storystage"

export const storyUpdateRecordBaseSchema = z.object({
  id: z.string(),
  createdAt: z.date(),
  storyId: z.string(),
  prevStageId: storyStageIdSchema.nullable(),
  newStageId: storyStageIdSchema.nullable(),
})

export interface StoryUpdateRecordRelations {
  story: z.infer<typeof storyBaseSchema> & StoryRelations
  prevStage: (z.infer<typeof storyStageBaseSchema> & StoryStageRelations) | null
  newStage: (z.infer<typeof storyStageBaseSchema> & StoryStageRelations) | null
}

export const storyUpdateRecordRelationsSchema: z.ZodObject<{
  [K in keyof StoryUpdateRecordRelations]: z.ZodType<StoryUpdateRecordRelations[K]>
}> = z.object({
  story: z.lazy(() => storyBaseSchema.merge(storyRelationsSchema)),
  prevStage: z.lazy(() => storyStageBaseSchema.merge(storyStageRelationsSchema)).nullable(),
  newStage: z.lazy(() => storyStageBaseSchema.merge(storyStageRelationsSchema)).nullable(),
})

export const storyUpdateRecordSchema = storyUpdateRecordBaseSchema
  .merge(storyUpdateRecordRelationsSchema)

export const storyUpdateRecordCreateSchema = storyUpdateRecordBaseSchema
  .extend({
    prevStageId: storyUpdateRecordBaseSchema.shape.prevStageId.unwrap(),
    newStageId: storyUpdateRecordBaseSchema.shape.newStageId.unwrap(),
  }).partial({
    id: true,
    createdAt: true,
    storyId: true,
    prevStage: true,
    prevStageId: true,
    newStage: true,
    newStageId: true,
  })

export const storyUpdateRecordUpdateSchema = storyUpdateRecordBaseSchema
  .extend({
    prevStageId: storyUpdateRecordBaseSchema.shape.prevStageId.unwrap(),
    newStageId: storyUpdateRecordBaseSchema.shape.newStageId.unwrap(),
  })
  .partial()
  
