import * as z from "zod"
import { userTypeSchema } from "./usertype"
import { TeamMemberRelations, teamMemberRelationsSchema, teamMemberBaseSchema } from "./teammember"
import { OrganizationMemberRelations, organizationMemberRelationsSchema, organizationMemberBaseSchema } from "./organizationmember"
import { TransactionRelations, transactionRelationsSchema, transactionBaseSchema } from "./transaction"
import { AccountRelations, accountRelationsSchema, accountBaseSchema } from "./account"
import { FileRelations, fileRelationsSchema, fileBaseSchema } from "./file"
import { VidRenderRelations, vidRenderRelationsSchema, vidRenderBaseSchema } from "./vidrender"
import { TrackRenderRelations, trackRenderRelationsSchema, trackRenderBaseSchema } from "./trackrender"
import { PlaylistCoverRenderRelations, playlistCoverRenderRelationsSchema, playlistCoverRenderBaseSchema } from "./playlistcoverrender"
import { PitchReviewRelations, pitchReviewRelationsSchema, pitchReviewBaseSchema } from "./pitchreview"
import { CampaignRelations, campaignRelationsSchema, campaignBaseSchema } from "./campaign"
import { CampaignUpdateRecordRelations, campaignUpdateRecordRelationsSchema, campaignUpdateRecordBaseSchema } from "./campaignupdaterecord"
import { EpicRelations, epicRelationsSchema, epicBaseSchema } from "./epic"
import { StoryBoardRelations, storyBoardRelationsSchema, storyBoardBaseSchema } from "./storyboard"
import { StoryRelations, storyRelationsSchema, storyBaseSchema } from "./story"
import { TaskRelations, taskRelationsSchema, taskBaseSchema } from "./task"

export const userBaseSchema = z.object({
  id: z.string(),
  type: userTypeSchema,
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  emailVerified: z.date().nullable(),
  displayName: z.string().nullable(),
  phone: z.string().nullable(),
  image: z.string().nullable(),
  marketing: z.boolean(),
  stripeId: z.string().nullable(),
  spotifyId: z.string().nullable(),
})

export interface UserRelations {
  teams: (z.infer<typeof teamMemberBaseSchema> & TeamMemberRelations)[]
  organizations: (z.infer<typeof organizationMemberBaseSchema> & OrganizationMemberRelations)[]
  transactions: (z.infer<typeof transactionBaseSchema> & TransactionRelations)[]
  accounts: (z.infer<typeof accountBaseSchema> & AccountRelations)[]
  createdFiles: (z.infer<typeof fileBaseSchema> & FileRelations)[]
  vidRenders: (z.infer<typeof vidRenderBaseSchema> & VidRenderRelations)[]
  trackRenders: (z.infer<typeof trackRenderBaseSchema> & TrackRenderRelations)[]
  playlistCoverRenders: (z.infer<typeof playlistCoverRenderBaseSchema> & PlaylistCoverRenderRelations)[]
  pitchReviews: (z.infer<typeof pitchReviewBaseSchema> & PitchReviewRelations)[]
  campaignsCreated: (z.infer<typeof campaignBaseSchema> & CampaignRelations)[]
  campaignUpdates: (z.infer<typeof campaignUpdateRecordBaseSchema> & CampaignUpdateRecordRelations)[]
  epicsCreated: (z.infer<typeof epicBaseSchema> & EpicRelations)[]
  epicsAssigned: (z.infer<typeof epicBaseSchema> & EpicRelations)[]
  storyBoardsCreated: (z.infer<typeof storyBoardBaseSchema> & StoryBoardRelations)[]
  storyBoardsAssigned: (z.infer<typeof storyBoardBaseSchema> & StoryBoardRelations)[]
  storiesCreated: (z.infer<typeof storyBaseSchema> & StoryRelations)[]
  storiesAssigned: (z.infer<typeof storyBaseSchema> & StoryRelations)[]
  tasksCreated: (z.infer<typeof taskBaseSchema> & TaskRelations)[]
  tasksAssigned: (z.infer<typeof taskBaseSchema> & TaskRelations)[]
}

export const userRelationsSchema: z.ZodObject<{
  [K in keyof UserRelations]: z.ZodType<UserRelations[K]>
}> = z.object({
  teams: z.lazy(() => teamMemberBaseSchema.merge(teamMemberRelationsSchema)).array(),
  organizations: z.lazy(() => organizationMemberBaseSchema.merge(organizationMemberRelationsSchema)).array(),
  transactions: z.lazy(() => transactionBaseSchema.merge(transactionRelationsSchema)).array(),
  accounts: z.lazy(() => accountBaseSchema.merge(accountRelationsSchema)).array(),
  createdFiles: z.lazy(() => fileBaseSchema.merge(fileRelationsSchema)).array(),
  vidRenders: z.lazy(() => vidRenderBaseSchema.merge(vidRenderRelationsSchema)).array(),
  trackRenders: z.lazy(() => trackRenderBaseSchema.merge(trackRenderRelationsSchema)).array(),
  playlistCoverRenders: z.lazy(() => playlistCoverRenderBaseSchema.merge(playlistCoverRenderRelationsSchema)).array(),
  pitchReviews: z.lazy(() => pitchReviewBaseSchema.merge(pitchReviewRelationsSchema)).array(),
  campaignsCreated: z.lazy(() => campaignBaseSchema.merge(campaignRelationsSchema)).array(),
  campaignUpdates: z.lazy(() => campaignUpdateRecordBaseSchema.merge(campaignUpdateRecordRelationsSchema)).array(),
  epicsCreated: z.lazy(() => epicBaseSchema.merge(epicRelationsSchema)).array(),
  epicsAssigned: z.lazy(() => epicBaseSchema.merge(epicRelationsSchema)).array(),
  storyBoardsCreated: z.lazy(() => storyBoardBaseSchema.merge(storyBoardRelationsSchema)).array(),
  storyBoardsAssigned: z.lazy(() => storyBoardBaseSchema.merge(storyBoardRelationsSchema)).array(),
  storiesCreated: z.lazy(() => storyBaseSchema.merge(storyRelationsSchema)).array(),
  storiesAssigned: z.lazy(() => storyBaseSchema.merge(storyRelationsSchema)).array(),
  tasksCreated: z.lazy(() => taskBaseSchema.merge(taskRelationsSchema)).array(),
  tasksAssigned: z.lazy(() => taskBaseSchema.merge(taskRelationsSchema)).array(),
})

export const userSchema = userBaseSchema
  .merge(userRelationsSchema)

export const userCreateSchema = userBaseSchema
  .extend({
    emailVerified: userBaseSchema.shape.emailVerified.unwrap(),
    displayName: userBaseSchema.shape.displayName.unwrap(),
    phone: userBaseSchema.shape.phone.unwrap(),
    image: userBaseSchema.shape.image.unwrap(),
    stripeId: userBaseSchema.shape.stripeId.unwrap(),
    spotifyId: userBaseSchema.shape.spotifyId.unwrap(),
  }).partial({
    emailVerified: true,
    displayName: true,
    phone: true,
    image: true,
    marketing: true,
    teams: true,
    organizations: true,
    stripeId: true,
    transactions: true,
    accounts: true,
    spotifyId: true,
    createdFiles: true,
    vidRenders: true,
    trackRenders: true,
    playlistCoverRenders: true,
    pitchReviews: true,
    campaignsCreated: true,
    campaignUpdates: true,
    epicsCreated: true,
    epicsAssigned: true,
    storyBoardsCreated: true,
    storyBoardsAssigned: true,
    storiesCreated: true,
    storiesAssigned: true,
    tasksCreated: true,
    tasksAssigned: true,
  })

export const userUpdateSchema = userBaseSchema
  .extend({
    emailVerified: userBaseSchema.shape.emailVerified.unwrap(),
    displayName: userBaseSchema.shape.displayName.unwrap(),
    phone: userBaseSchema.shape.phone.unwrap(),
    image: userBaseSchema.shape.image.unwrap(),
    stripeId: userBaseSchema.shape.stripeId.unwrap(),
    spotifyId: userBaseSchema.shape.spotifyId.unwrap(),
  })
  .partial()
  
