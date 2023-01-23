import * as z from "zod"
import { TransactionRelations, transactionRelationsSchema, transactionBaseSchema } from "./transaction"
import { AccountRelations, accountRelationsSchema, accountBaseSchema } from "./account"
import { SessionRelations, sessionRelationsSchema, sessionBaseSchema } from "./session"
import { PitchReviewRelations, pitchReviewRelationsSchema, pitchReviewBaseSchema } from "./pitchreview"
import { CampaignRelations, campaignRelationsSchema, campaignBaseSchema } from "./campaign"
import { ArtistRelations, artistRelationsSchema, artistBaseSchema } from "./artist"
import { ArtistUserRoleRelations, artistUserRoleRelationsSchema, artistUserRoleBaseSchema } from "./artistuserrole"
import { AnalyticsEndpointRelations, analyticsEndpointRelationsSchema, analyticsEndpointBaseSchema } from "./analyticsendpoint"
import { AudienceRelations, audienceRelationsSchema, audienceBaseSchema } from "./audience"
import { EpicRelations, epicRelationsSchema, epicBaseSchema } from "./epic"
import { StoryRelations, storyRelationsSchema, storyBaseSchema } from "./story"
import { TaskRelations, taskRelationsSchema, taskBaseSchema } from "./task"
import { FileRelations, fileRelationsSchema, fileBaseSchema } from "./file"
import { PlaylistRelations, playlistRelationsSchema, playlistBaseSchema } from "./playlist"
import { PlaylistCoverRenderRelations, playlistCoverRenderRelationsSchema, playlistCoverRenderBaseSchema } from "./playlistcoverrender"
import { VidRenderRelations, vidRenderRelationsSchema, vidRenderBaseSchema } from "./vidrender"
import { LoginTokenRelations, loginTokenRelationsSchema, loginTokenBaseSchema } from "./logintoken"

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
  campaigns: (z.infer<typeof campaignBaseSchema> & CampaignRelations)[]
  artists: (z.infer<typeof artistBaseSchema> & ArtistRelations)[]
  artistUserRoles: (z.infer<typeof artistUserRoleBaseSchema> & ArtistUserRoleRelations)[]
  analyticsEndpoints: (z.infer<typeof analyticsEndpointBaseSchema> & AnalyticsEndpointRelations)[]
  audiences: (z.infer<typeof audienceBaseSchema> & AudienceRelations)[]
  epics: (z.infer<typeof epicBaseSchema> & EpicRelations)[]
  stories: (z.infer<typeof storyBaseSchema> & StoryRelations)[]
  tasks: (z.infer<typeof taskBaseSchema> & TaskRelations)[]
  files: (z.infer<typeof fileBaseSchema> & FileRelations)[]
  playlists: (z.infer<typeof playlistBaseSchema> & PlaylistRelations)[]
  playlistCoverRenders: (z.infer<typeof playlistCoverRenderBaseSchema> & PlaylistCoverRenderRelations)[]
  vidRenders: (z.infer<typeof vidRenderBaseSchema> & VidRenderRelations)[]
  loginTokens: (z.infer<typeof loginTokenBaseSchema> & LoginTokenRelations)[]
}

export const userRelationsSchema: z.ZodObject<{
  [K in keyof UserRelations]: z.ZodType<UserRelations[K]>
}> = z.object({
  transactions: z.lazy(() => transactionBaseSchema.merge(transactionRelationsSchema)).array(),
  accounts: z.lazy(() => accountBaseSchema.merge(accountRelationsSchema)).array(),
  sessions: z.lazy(() => sessionBaseSchema.merge(sessionRelationsSchema)).array(),
  pitchReviews: z.lazy(() => pitchReviewBaseSchema.merge(pitchReviewRelationsSchema)).array(),
  campaigns: z.lazy(() => campaignBaseSchema.merge(campaignRelationsSchema)).array(),
  artists: z.lazy(() => artistBaseSchema.merge(artistRelationsSchema)).array(),
  artistUserRoles: z.lazy(() => artistUserRoleBaseSchema.merge(artistUserRoleRelationsSchema)).array(),
  analyticsEndpoints: z.lazy(() => analyticsEndpointBaseSchema.merge(analyticsEndpointRelationsSchema)).array(),
  audiences: z.lazy(() => audienceBaseSchema.merge(audienceRelationsSchema)).array(),
  epics: z.lazy(() => epicBaseSchema.merge(epicRelationsSchema)).array(),
  stories: z.lazy(() => storyBaseSchema.merge(storyRelationsSchema)).array(),
  tasks: z.lazy(() => taskBaseSchema.merge(taskRelationsSchema)).array(),
  files: z.lazy(() => fileBaseSchema.merge(fileRelationsSchema)).array(),
  playlists: z.lazy(() => playlistBaseSchema.merge(playlistRelationsSchema)).array(),
  playlistCoverRenders: z.lazy(() => playlistCoverRenderBaseSchema.merge(playlistCoverRenderRelationsSchema)).array(),
  vidRenders: z.lazy(() => vidRenderBaseSchema.merge(vidRenderRelationsSchema)).array(),
  loginTokens: z.lazy(() => loginTokenBaseSchema.merge(loginTokenRelationsSchema)).array(),
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
    campaigns: true,
    artists: true,
    artistUserRoles: true,
    analyticsEndpoints: true,
    audiences: true,
    epics: true,
    stories: true,
    tasks: true,
    files: true,
    playlists: true,
    playlistCoverRenders: true,
    vidRenders: true,
    loginTokens: true,
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
  
