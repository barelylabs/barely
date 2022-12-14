import * as z from "zod"
import { storyStageIdSchema } from "./storystageid"
import { UserRelations, userRelationsSchema, userBaseSchema } from "./user"
import { ArtistRelations, artistRelationsSchema, artistBaseSchema } from "./artist"
import { EpicRelations, epicRelationsSchema, epicBaseSchema } from "./epic"
import { StoryStageRelations, storyStageRelationsSchema, storyStageBaseSchema } from "./storystage"
import { StoryUpdateRecordRelations, storyUpdateRecordRelationsSchema, storyUpdateRecordBaseSchema } from "./storyupdaterecord"
import { TaskRelations, taskRelationsSchema, taskBaseSchema } from "./task"

export const storyBaseSchema = z.object({
  id: z.string(),
  createdAt: z.date(),
  name: z.string().nullable(),
  description: z.string().nullable(),
  dueDate: z.date().nullable(),
  lexoRank: z.string(),
  priority: z.string().nullable(),
  userId: z.string(),
  artistId: z.string().nullable(),
  epicId: z.string().nullable(),
  stageId: storyStageIdSchema,
})

export interface StoryRelations {
  user: z.infer<typeof userBaseSchema> & UserRelations
  artist: (z.infer<typeof artistBaseSchema> & ArtistRelations) | null
  epic: (z.infer<typeof epicBaseSchema> & EpicRelations) | null
  stage: z.infer<typeof storyStageBaseSchema> & StoryStageRelations
  update: (z.infer<typeof storyUpdateRecordBaseSchema> & StoryUpdateRecordRelations)[]
  Task: (z.infer<typeof taskBaseSchema> & TaskRelations)[]
}

export const storyRelationsSchema: z.ZodObject<{
  [K in keyof StoryRelations]: z.ZodType<StoryRelations[K]>
}> = z.object({
  user: z.lazy(() => userBaseSchema.merge(userRelationsSchema)),
  artist: z.lazy(() => artistBaseSchema.merge(artistRelationsSchema)).nullable(),
  epic: z.lazy(() => epicBaseSchema.merge(epicRelationsSchema)).nullable(),
  stage: z.lazy(() => storyStageBaseSchema.merge(storyStageRelationsSchema)),
  update: z.lazy(() => storyUpdateRecordBaseSchema.merge(storyUpdateRecordRelationsSchema)).array(),
  Task: z.lazy(() => taskBaseSchema.merge(taskRelationsSchema)).array(),
})

export const storySchema = storyBaseSchema
  .merge(storyRelationsSchema)

export const storyCreateSchema = storyBaseSchema
  .extend({
    name: storyBaseSchema.shape.name.unwrap(),
    description: storyBaseSchema.shape.description.unwrap(),
    dueDate: storyBaseSchema.shape.dueDate.unwrap(),
    priority: storyBaseSchema.shape.priority.unwrap(),
    artistId: storyBaseSchema.shape.artistId.unwrap(),
    epicId: storyBaseSchema.shape.epicId.unwrap(),
  }).partial({
    id: true,
    createdAt: true,
    name: true,
    description: true,
    dueDate: true,
    priority: true,
    userId: true,
    artist: true,
    artistId: true,
    epic: true,
    epicId: true,
    stageId: true,
    update: true,
    Task: true,
  })

export const storyUpdateSchema = storyBaseSchema
  .extend({
    name: storyBaseSchema.shape.name.unwrap(),
    description: storyBaseSchema.shape.description.unwrap(),
    dueDate: storyBaseSchema.shape.dueDate.unwrap(),
    priority: storyBaseSchema.shape.priority.unwrap(),
    artistId: storyBaseSchema.shape.artistId.unwrap(),
    epicId: storyBaseSchema.shape.epicId.unwrap(),
  })
  .partial()
  
