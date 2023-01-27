import * as z from "zod"
import { UserRelations, userRelationsSchema, userBaseSchema } from "./user"
import { StoryRelations, storyRelationsSchema, storyBaseSchema } from "./story"
import { TeamRelations, teamRelationsSchema, teamBaseSchema } from "./team"

export const taskBaseSchema = z.object({
  id: z.string(),
  createdAt: z.date(),
  name: z.string(),
  description: z.string().nullable(),
  dueDate: z.date().nullable(),
  lexoRank: z.string(),
  priority: z.string().nullable(),
  today: z.boolean(),
  complete: z.boolean(),
  createdById: z.string(),
  assignedToId: z.string().nullable(),
  storyId: z.string().nullable(),
  delete: z.boolean(),
  deleteDate: z.date().nullable(),
  teamId: z.string().nullable(),
})

export interface TaskRelations {
  createdBy: z.infer<typeof userBaseSchema> & UserRelations
  assignedTo: (z.infer<typeof userBaseSchema> & UserRelations) | null
  story: (z.infer<typeof storyBaseSchema> & StoryRelations) | null
  team: (z.infer<typeof teamBaseSchema> & TeamRelations) | null
}

export const taskRelationsSchema: z.ZodObject<{
  [K in keyof TaskRelations]: z.ZodType<TaskRelations[K]>
}> = z.object({
  createdBy: z.lazy(() => userBaseSchema.merge(userRelationsSchema)),
  assignedTo: z.lazy(() => userBaseSchema.merge(userRelationsSchema)).nullable(),
  story: z.lazy(() => storyBaseSchema.merge(storyRelationsSchema)).nullable(),
  team: z.lazy(() => teamBaseSchema.merge(teamRelationsSchema)).nullable(),
})

export const taskSchema = taskBaseSchema
  .merge(taskRelationsSchema)

export const taskCreateSchema = taskBaseSchema
  .extend({
    description: taskBaseSchema.shape.description.unwrap(),
    dueDate: taskBaseSchema.shape.dueDate.unwrap(),
    priority: taskBaseSchema.shape.priority.unwrap(),
    assignedToId: taskBaseSchema.shape.assignedToId.unwrap(),
    storyId: taskBaseSchema.shape.storyId.unwrap(),
    deleteDate: taskBaseSchema.shape.deleteDate.unwrap(),
    teamId: taskBaseSchema.shape.teamId.unwrap(),
  }).partial({
    id: true,
    createdAt: true,
    description: true,
    dueDate: true,
    priority: true,
    createdById: true,
    assignedTo: true,
    assignedToId: true,
    story: true,
    storyId: true,
    deleteDate: true,
    team: true,
    teamId: true,
  })

export const taskUpdateSchema = taskBaseSchema
  .extend({
    description: taskBaseSchema.shape.description.unwrap(),
    dueDate: taskBaseSchema.shape.dueDate.unwrap(),
    priority: taskBaseSchema.shape.priority.unwrap(),
    assignedToId: taskBaseSchema.shape.assignedToId.unwrap(),
    storyId: taskBaseSchema.shape.storyId.unwrap(),
    deleteDate: taskBaseSchema.shape.deleteDate.unwrap(),
    teamId: taskBaseSchema.shape.teamId.unwrap(),
  })
  .partial()
  
