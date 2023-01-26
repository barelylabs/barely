import * as z from "zod"
import { UserRelations, userRelationsSchema, userBaseSchema } from "./user"
import { EpicRelations, epicRelationsSchema, epicBaseSchema } from "./epic"
import { StoryColumnRelations, storyColumnRelationsSchema, storyColumnBaseSchema } from "./storycolumn"
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
  createdById: z.string(),
  assignedToId: z.string().nullable(),
  forUserId: z.string().nullable(),
  epicId: z.string().nullable(),
  columnId: z.string(),
})

export interface StoryRelations {
  createdBy: z.infer<typeof userBaseSchema> & UserRelations
  assignedTo: (z.infer<typeof userBaseSchema> & UserRelations) | null
  forUser: (z.infer<typeof userBaseSchema> & UserRelations) | null
  epic: (z.infer<typeof epicBaseSchema> & EpicRelations) | null
  column: z.infer<typeof storyColumnBaseSchema> & StoryColumnRelations
  update: (z.infer<typeof storyUpdateRecordBaseSchema> & StoryUpdateRecordRelations)[]
  tasks: (z.infer<typeof taskBaseSchema> & TaskRelations)[]
}

export const storyRelationsSchema: z.ZodObject<{
  [K in keyof StoryRelations]: z.ZodType<StoryRelations[K]>
}> = z.object({
  createdBy: z.lazy(() => userBaseSchema.merge(userRelationsSchema)),
  assignedTo: z.lazy(() => userBaseSchema.merge(userRelationsSchema)).nullable(),
  forUser: z.lazy(() => userBaseSchema.merge(userRelationsSchema)).nullable(),
  epic: z.lazy(() => epicBaseSchema.merge(epicRelationsSchema)).nullable(),
  column: z.lazy(() => storyColumnBaseSchema.merge(storyColumnRelationsSchema)),
  update: z.lazy(() => storyUpdateRecordBaseSchema.merge(storyUpdateRecordRelationsSchema)).array(),
  tasks: z.lazy(() => taskBaseSchema.merge(taskRelationsSchema)).array(),
})

export const storySchema = storyBaseSchema
  .merge(storyRelationsSchema)

export const storyCreateSchema = storyBaseSchema
  .extend({
    name: storyBaseSchema.shape.name.unwrap(),
    description: storyBaseSchema.shape.description.unwrap(),
    dueDate: storyBaseSchema.shape.dueDate.unwrap(),
    priority: storyBaseSchema.shape.priority.unwrap(),
    assignedToId: storyBaseSchema.shape.assignedToId.unwrap(),
    forUserId: storyBaseSchema.shape.forUserId.unwrap(),
    epicId: storyBaseSchema.shape.epicId.unwrap(),
  }).partial({
    id: true,
    createdAt: true,
    name: true,
    description: true,
    dueDate: true,
    priority: true,
    createdById: true,
    assignedTo: true,
    assignedToId: true,
    forUser: true,
    forUserId: true,
    epic: true,
    epicId: true,
    columnId: true,
    update: true,
    tasks: true,
  })

export const storyUpdateSchema = storyBaseSchema
  .extend({
    name: storyBaseSchema.shape.name.unwrap(),
    description: storyBaseSchema.shape.description.unwrap(),
    dueDate: storyBaseSchema.shape.dueDate.unwrap(),
    priority: storyBaseSchema.shape.priority.unwrap(),
    assignedToId: storyBaseSchema.shape.assignedToId.unwrap(),
    forUserId: storyBaseSchema.shape.forUserId.unwrap(),
    epicId: storyBaseSchema.shape.epicId.unwrap(),
  })
  .partial()
  
