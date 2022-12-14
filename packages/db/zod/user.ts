import * as z from "zod"
import { TransactionRelations, transactionRelationsSchema, transactionBaseSchema } from "./transaction"
import { AccountRelations, accountRelationsSchema, accountBaseSchema } from "./account"
import { SessionRelations, sessionRelationsSchema, sessionBaseSchema } from "./session"
import { PitchReviewRelations, pitchReviewRelationsSchema, pitchReviewBaseSchema } from "./pitchreview"
import { ArtistRelations, artistRelationsSchema, artistBaseSchema } from "./artist"
import { RemarketingRelations, remarketingRelationsSchema, remarketingBaseSchema } from "./remarketing"
import { AudienceRelations, audienceRelationsSchema, audienceBaseSchema } from "./audience"
import { EpicRelations, epicRelationsSchema, epicBaseSchema } from "./epic"
import { StoryRelations, storyRelationsSchema, storyBaseSchema } from "./story"
import { TaskRelations, taskRelationsSchema, taskBaseSchema } from "./task"
import { FileRelations, fileRelationsSchema, fileBaseSchema } from "./file"
import { PlaylistRelations, playlistRelationsSchema, playlistBaseSchema } from "./playlist"
import { PlaylistCoverRenderRelations, playlistCoverRenderRelationsSchema, playlistCoverRenderBaseSchema } from "./playlistcoverrender"
import { VidRenderRelations, vidRenderRelationsSchema, vidRenderBaseSchema } from "./vidrender"

export const userBaseSchema = z.object({
  id: z.string(),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  name: z.string().nullable(),
  email: z.string().email().nullable(),
  emailVerified: z.date().nullable(),
  phone: z.string().nullable(),
  image: z.string().nullable(),
  marketingOptIn: z.boolean(),
  stripeId: z.string().nullable(),
})

export interface UserRelations {
  transactions: (z.infer<typeof transactionBaseSchema> & TransactionRelations)[]
  accounts: (z.infer<typeof accountBaseSchema> & AccountRelations)[]
  sessions: (z.infer<typeof sessionBaseSchema> & SessionRelations)[]
  pitchReviews: (z.infer<typeof pitchReviewBaseSchema> & PitchReviewRelations)[]
  artists: (z.infer<typeof artistBaseSchema> & ArtistRelations)[]
  remarketing: (z.infer<typeof remarketingBaseSchema> & RemarketingRelations)[]
  audiences: (z.infer<typeof audienceBaseSchema> & AudienceRelations)[]
  epics: (z.infer<typeof epicBaseSchema> & EpicRelations)[]
  stories: (z.infer<typeof storyBaseSchema> & StoryRelations)[]
  tasks: (z.infer<typeof taskBaseSchema> & TaskRelations)[]
  files: (z.infer<typeof fileBaseSchema> & FileRelations)[]
  playlists: (z.infer<typeof playlistBaseSchema> & PlaylistRelations)[]
  playlistCoverRenders: (z.infer<typeof playlistCoverRenderBaseSchema> & PlaylistCoverRenderRelations)[]
  vidRenders: (z.infer<typeof vidRenderBaseSchema> & VidRenderRelations)[]
}

export const userRelationsSchema: z.ZodObject<{
  [K in keyof UserRelations]: z.ZodType<UserRelations[K]>
}> = z.object({
  transactions: z.lazy(() => transactionBaseSchema.merge(transactionRelationsSchema)).array(),
  accounts: z.lazy(() => accountBaseSchema.merge(accountRelationsSchema)).array(),
  sessions: z.lazy(() => sessionBaseSchema.merge(sessionRelationsSchema)).array(),
  pitchReviews: z.lazy(() => pitchReviewBaseSchema.merge(pitchReviewRelationsSchema)).array(),
  artists: z.lazy(() => artistBaseSchema.merge(artistRelationsSchema)).array(),
  remarketing: z.lazy(() => remarketingBaseSchema.merge(remarketingRelationsSchema)).array(),
  audiences: z.lazy(() => audienceBaseSchema.merge(audienceRelationsSchema)).array(),
  epics: z.lazy(() => epicBaseSchema.merge(epicRelationsSchema)).array(),
  stories: z.lazy(() => storyBaseSchema.merge(storyRelationsSchema)).array(),
  tasks: z.lazy(() => taskBaseSchema.merge(taskRelationsSchema)).array(),
  files: z.lazy(() => fileBaseSchema.merge(fileRelationsSchema)).array(),
  playlists: z.lazy(() => playlistBaseSchema.merge(playlistRelationsSchema)).array(),
  playlistCoverRenders: z.lazy(() => playlistCoverRenderBaseSchema.merge(playlistCoverRenderRelationsSchema)).array(),
  vidRenders: z.lazy(() => vidRenderBaseSchema.merge(vidRenderRelationsSchema)).array(),
})

export const userSchema = userBaseSchema
  .merge(userRelationsSchema)

export const userCreateSchema = userBaseSchema
  .extend({
    firstName: userBaseSchema.shape.firstName.unwrap(),
    lastName: userBaseSchema.shape.lastName.unwrap(),
    name: userBaseSchema.shape.name.unwrap(),
    email: userBaseSchema.shape.email.unwrap(),
    emailVerified: userBaseSchema.shape.emailVerified.unwrap(),
    phone: userBaseSchema.shape.phone.unwrap(),
    image: userBaseSchema.shape.image.unwrap(),
    stripeId: userBaseSchema.shape.stripeId.unwrap(),
  }).partial({
    id: true,
    firstName: true,
    lastName: true,
    name: true,
    email: true,
    emailVerified: true,
    phone: true,
    image: true,
    marketingOptIn: true,
    stripeId: true,
    transactions: true,
    accounts: true,
    sessions: true,
    pitchReviews: true,
    artists: true,
    remarketing: true,
    audiences: true,
    epics: true,
    stories: true,
    tasks: true,
    files: true,
    playlists: true,
    playlistCoverRenders: true,
    vidRenders: true,
  })

export const userUpdateSchema = userBaseSchema
  .extend({
    firstName: userBaseSchema.shape.firstName.unwrap(),
    lastName: userBaseSchema.shape.lastName.unwrap(),
    name: userBaseSchema.shape.name.unwrap(),
    email: userBaseSchema.shape.email.unwrap(),
    emailVerified: userBaseSchema.shape.emailVerified.unwrap(),
    phone: userBaseSchema.shape.phone.unwrap(),
    image: userBaseSchema.shape.image.unwrap(),
    stripeId: userBaseSchema.shape.stripeId.unwrap(),
  })
  .partial()
  
