import * as z from "zod"
import { UserRelations, userRelationsSchema, userBaseSchema } from "./user"
import { ArtistRelations, artistRelationsSchema, artistBaseSchema } from "./artist"
import { StoryRelations, storyRelationsSchema, storyBaseSchema } from "./story"

export const epicBaseSchema = z.object({
  id: z.string(),
  createdAt: z.date(),
  name: z.string(),
  description: z.string().nullable(),
  targetStartDate: z.date().nullable(),
  targetCompleteDate: z.date().nullable(),
  startDate: z.date().nullable(),
  color: z.string().nullable(),
  complete: z.boolean().nullable(),
  lexoRank: z.string(),
  ownerId: z.string(),
  artistId: z.string().nullable(),
})

export interface EpicRelations {
  owner: z.infer<typeof userBaseSchema> & UserRelations
  artist: (z.infer<typeof artistBaseSchema> & ArtistRelations) | null
  stories: (z.infer<typeof storyBaseSchema> & StoryRelations)[]
}

export const epicRelationsSchema: z.ZodObject<{
  [K in keyof EpicRelations]: z.ZodType<EpicRelations[K]>
}> = z.object({
  owner: z.lazy(() => userBaseSchema.merge(userRelationsSchema)),
  artist: z.lazy(() => artistBaseSchema.merge(artistRelationsSchema)).nullable(),
  stories: z.lazy(() => storyBaseSchema.merge(storyRelationsSchema)).array(),
})

export const epicSchema = epicBaseSchema
  .merge(epicRelationsSchema)

export const epicCreateSchema = epicBaseSchema
  .extend({
    description: epicBaseSchema.shape.description.unwrap(),
    targetStartDate: epicBaseSchema.shape.targetStartDate.unwrap(),
    targetCompleteDate: epicBaseSchema.shape.targetCompleteDate.unwrap(),
    startDate: epicBaseSchema.shape.startDate.unwrap(),
    color: epicBaseSchema.shape.color.unwrap(),
    complete: epicBaseSchema.shape.complete.unwrap(),
    artistId: epicBaseSchema.shape.artistId.unwrap(),
  }).partial({
    id: true,
    createdAt: true,
    description: true,
    targetStartDate: true,
    targetCompleteDate: true,
    startDate: true,
    color: true,
    complete: true,
    ownerId: true,
    artist: true,
    artistId: true,
    stories: true,
  })

export const epicUpdateSchema = epicBaseSchema
  .extend({
    description: epicBaseSchema.shape.description.unwrap(),
    targetStartDate: epicBaseSchema.shape.targetStartDate.unwrap(),
    targetCompleteDate: epicBaseSchema.shape.targetCompleteDate.unwrap(),
    startDate: epicBaseSchema.shape.startDate.unwrap(),
    color: epicBaseSchema.shape.color.unwrap(),
    complete: epicBaseSchema.shape.complete.unwrap(),
    artistId: epicBaseSchema.shape.artistId.unwrap(),
  })
  .partial()
  
