import * as z from "zod"
import { userTypeSchema } from "./usertype"
import { TeamRelations, teamRelationsSchema, teamBaseSchema } from "./team"
import { CollaboratorRoleRelations, collaboratorRoleRelationsSchema, collaboratorRoleBaseSchema } from "./collaboratorrole"
import { TransactionRelations, transactionRelationsSchema, transactionBaseSchema } from "./transaction"
import { AccountRelations, accountRelationsSchema, accountBaseSchema } from "./account"
import { FileRelations, fileRelationsSchema, fileBaseSchema } from "./file"
import { TrackRelations, trackRelationsSchema, trackBaseSchema } from "./track"
import { PlaylistRelations, playlistRelationsSchema, playlistBaseSchema } from "./playlist"
import { PitchReviewRelations, pitchReviewRelationsSchema, pitchReviewBaseSchema } from "./pitchreview"
import { CampaignRelations, campaignRelationsSchema, campaignBaseSchema } from "./campaign"
import { CampaignUpdateRecordRelations, campaignUpdateRecordRelationsSchema, campaignUpdateRecordBaseSchema } from "./campaignupdaterecord"
import { AdCreativeRelations, adCreativeRelationsSchema, adCreativeBaseSchema } from "./adcreative"
import { AudienceRelations, audienceRelationsSchema, audienceBaseSchema } from "./audience"
import { LinkRelations, linkRelationsSchema, linkBaseSchema } from "./link"
import { SocialLinkRelations, socialLinkRelationsSchema, socialLinkBaseSchema } from "./sociallink"
import { ExternalWebsiteRelations, externalWebsiteRelationsSchema, externalWebsiteBaseSchema } from "./externalwebsite"
import { AnalyticsEndpointRelations, analyticsEndpointRelationsSchema, analyticsEndpointBaseSchema } from "./analyticsendpoint"
import { BioRelations, bioRelationsSchema, bioBaseSchema } from "./bio"
import { ButtonRelations, buttonRelationsSchema, buttonBaseSchema } from "./button"
import { FormRelations, formRelationsSchema, formBaseSchema } from "./form"
import { EpicRelations, epicRelationsSchema, epicBaseSchema } from "./epic"
import { StoryBoardRelations, storyBoardRelationsSchema, storyBoardBaseSchema } from "./storyboard"
import { StoryRelations, storyRelationsSchema, storyBaseSchema } from "./story"
import { TaskRelations, taskRelationsSchema, taskBaseSchema } from "./task"

export const userBaseSchema = z.object({
  id: z.string(),
  type: userTypeSchema,
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  emailVerified: z.date().nullable(),
  handle: z.string().nullable(),
  displayName: z.string().nullable(),
  email: z.string().email().nullable(),
  phone: z.string().nullable(),
  image: z.string().nullable(),
  marketing: z.boolean(),
  stripeId: z.string().nullable(),
  spotifyId: z.string().nullable(),
})

export interface UserRelations {
  teams: (z.infer<typeof teamBaseSchema> & TeamRelations)[]
  collaborators: (z.infer<typeof collaboratorRoleBaseSchema> & CollaboratorRoleRelations)[]
  collaboratorFor: (z.infer<typeof collaboratorRoleBaseSchema> & CollaboratorRoleRelations)[]
  transactions: (z.infer<typeof transactionBaseSchema> & TransactionRelations)[]
  accounts: (z.infer<typeof accountBaseSchema> & AccountRelations)[]
  defaultAccounts: (z.infer<typeof accountBaseSchema> & AccountRelations)[]
  files: (z.infer<typeof fileBaseSchema> & FileRelations)[]
  tracks: (z.infer<typeof trackBaseSchema> & TrackRelations)[]
  playlists: (z.infer<typeof playlistBaseSchema> & PlaylistRelations)[]
  pitchReviews: (z.infer<typeof pitchReviewBaseSchema> & PitchReviewRelations)[]
  campaignsCreated: (z.infer<typeof campaignBaseSchema> & CampaignRelations)[]
  campaignUpdates: (z.infer<typeof campaignUpdateRecordBaseSchema> & CampaignUpdateRecordRelations)[]
  adCreatives: (z.infer<typeof adCreativeBaseSchema> & AdCreativeRelations)[]
  audiences: (z.infer<typeof audienceBaseSchema> & AudienceRelations)[]
  links: (z.infer<typeof linkBaseSchema> & LinkRelations)[]
  socialLinks: (z.infer<typeof socialLinkBaseSchema> & SocialLinkRelations)[]
  externalWebsites: (z.infer<typeof externalWebsiteBaseSchema> & ExternalWebsiteRelations)[]
  analyticsEndpoints: (z.infer<typeof analyticsEndpointBaseSchema> & AnalyticsEndpointRelations)[]
  bios: (z.infer<typeof bioBaseSchema> & BioRelations)[]
  rootBio: (z.infer<typeof bioBaseSchema> & BioRelations) | null
  buttons: (z.infer<typeof buttonBaseSchema> & ButtonRelations)[]
  forms: (z.infer<typeof formBaseSchema> & FormRelations)[]
  epicsCreated: (z.infer<typeof epicBaseSchema> & EpicRelations)[]
  epicsAssigned: (z.infer<typeof epicBaseSchema> & EpicRelations)[]
  epicsForUser: (z.infer<typeof epicBaseSchema> & EpicRelations)[]
  storyBoardsCreated: (z.infer<typeof storyBoardBaseSchema> & StoryBoardRelations)[]
  storyBoardsAssigned: (z.infer<typeof storyBoardBaseSchema> & StoryBoardRelations)[]
  storiesCreated: (z.infer<typeof storyBaseSchema> & StoryRelations)[]
  storiesAssigned: (z.infer<typeof storyBaseSchema> & StoryRelations)[]
  storiesForUser: (z.infer<typeof storyBaseSchema> & StoryRelations)[]
  tasksCreated: (z.infer<typeof taskBaseSchema> & TaskRelations)[]
  tasksAssigned: (z.infer<typeof taskBaseSchema> & TaskRelations)[]
}

export const userRelationsSchema: z.ZodObject<{
  [K in keyof UserRelations]: z.ZodType<UserRelations[K]>
}> = z.object({
  teams: z.lazy(() => teamBaseSchema.merge(teamRelationsSchema)).array(),
  collaborators: z.lazy(() => collaboratorRoleBaseSchema.merge(collaboratorRoleRelationsSchema)).array(),
  collaboratorFor: z.lazy(() => collaboratorRoleBaseSchema.merge(collaboratorRoleRelationsSchema)).array(),
  transactions: z.lazy(() => transactionBaseSchema.merge(transactionRelationsSchema)).array(),
  accounts: z.lazy(() => accountBaseSchema.merge(accountRelationsSchema)).array(),
  defaultAccounts: z.lazy(() => accountBaseSchema.merge(accountRelationsSchema)).array(),
  files: z.lazy(() => fileBaseSchema.merge(fileRelationsSchema)).array(),
  tracks: z.lazy(() => trackBaseSchema.merge(trackRelationsSchema)).array(),
  playlists: z.lazy(() => playlistBaseSchema.merge(playlistRelationsSchema)).array(),
  pitchReviews: z.lazy(() => pitchReviewBaseSchema.merge(pitchReviewRelationsSchema)).array(),
  campaignsCreated: z.lazy(() => campaignBaseSchema.merge(campaignRelationsSchema)).array(),
  campaignUpdates: z.lazy(() => campaignUpdateRecordBaseSchema.merge(campaignUpdateRecordRelationsSchema)).array(),
  adCreatives: z.lazy(() => adCreativeBaseSchema.merge(adCreativeRelationsSchema)).array(),
  audiences: z.lazy(() => audienceBaseSchema.merge(audienceRelationsSchema)).array(),
  links: z.lazy(() => linkBaseSchema.merge(linkRelationsSchema)).array(),
  socialLinks: z.lazy(() => socialLinkBaseSchema.merge(socialLinkRelationsSchema)).array(),
  externalWebsites: z.lazy(() => externalWebsiteBaseSchema.merge(externalWebsiteRelationsSchema)).array(),
  analyticsEndpoints: z.lazy(() => analyticsEndpointBaseSchema.merge(analyticsEndpointRelationsSchema)).array(),
  bios: z.lazy(() => bioBaseSchema.merge(bioRelationsSchema)).array(),
  rootBio: z.lazy(() => bioBaseSchema.merge(bioRelationsSchema)).nullable(),
  buttons: z.lazy(() => buttonBaseSchema.merge(buttonRelationsSchema)).array(),
  forms: z.lazy(() => formBaseSchema.merge(formRelationsSchema)).array(),
  epicsCreated: z.lazy(() => epicBaseSchema.merge(epicRelationsSchema)).array(),
  epicsAssigned: z.lazy(() => epicBaseSchema.merge(epicRelationsSchema)).array(),
  epicsForUser: z.lazy(() => epicBaseSchema.merge(epicRelationsSchema)).array(),
  storyBoardsCreated: z.lazy(() => storyBoardBaseSchema.merge(storyBoardRelationsSchema)).array(),
  storyBoardsAssigned: z.lazy(() => storyBoardBaseSchema.merge(storyBoardRelationsSchema)).array(),
  storiesCreated: z.lazy(() => storyBaseSchema.merge(storyRelationsSchema)).array(),
  storiesAssigned: z.lazy(() => storyBaseSchema.merge(storyRelationsSchema)).array(),
  storiesForUser: z.lazy(() => storyBaseSchema.merge(storyRelationsSchema)).array(),
  tasksCreated: z.lazy(() => taskBaseSchema.merge(taskRelationsSchema)).array(),
  tasksAssigned: z.lazy(() => taskBaseSchema.merge(taskRelationsSchema)).array(),
})

export const userSchema = userBaseSchema
  .merge(userRelationsSchema)

export const userCreateSchema = userBaseSchema
  .extend({
    firstName: userBaseSchema.shape.firstName.unwrap(),
    lastName: userBaseSchema.shape.lastName.unwrap(),
    emailVerified: userBaseSchema.shape.emailVerified.unwrap(),
    handle: userBaseSchema.shape.handle.unwrap(),
    displayName: userBaseSchema.shape.displayName.unwrap(),
    email: userBaseSchema.shape.email.unwrap(),
    phone: userBaseSchema.shape.phone.unwrap(),
    image: userBaseSchema.shape.image.unwrap(),
    stripeId: userBaseSchema.shape.stripeId.unwrap(),
    spotifyId: userBaseSchema.shape.spotifyId.unwrap(),
  }).partial({
    id: true,
    firstName: true,
    lastName: true,
    emailVerified: true,
    handle: true,
    displayName: true,
    email: true,
    phone: true,
    image: true,
    marketing: true,
    teams: true,
    collaborators: true,
    collaboratorFor: true,
    stripeId: true,
    transactions: true,
    accounts: true,
    defaultAccounts: true,
    spotifyId: true,
    files: true,
    tracks: true,
    playlists: true,
    pitchReviews: true,
    campaignsCreated: true,
    campaignUpdates: true,
    adCreatives: true,
    audiences: true,
    links: true,
    socialLinks: true,
    externalWebsites: true,
    analyticsEndpoints: true,
    bios: true,
    rootBio: true,
    buttons: true,
    forms: true,
    epicsCreated: true,
    epicsAssigned: true,
    epicsForUser: true,
    storyBoardsCreated: true,
    storyBoardsAssigned: true,
    storiesCreated: true,
    storiesAssigned: true,
    storiesForUser: true,
    tasksCreated: true,
    tasksAssigned: true,
  })

export const userUpdateSchema = userBaseSchema
  .extend({
    firstName: userBaseSchema.shape.firstName.unwrap(),
    lastName: userBaseSchema.shape.lastName.unwrap(),
    emailVerified: userBaseSchema.shape.emailVerified.unwrap(),
    handle: userBaseSchema.shape.handle.unwrap(),
    displayName: userBaseSchema.shape.displayName.unwrap(),
    email: userBaseSchema.shape.email.unwrap(),
    phone: userBaseSchema.shape.phone.unwrap(),
    image: userBaseSchema.shape.image.unwrap(),
    stripeId: userBaseSchema.shape.stripeId.unwrap(),
    spotifyId: userBaseSchema.shape.spotifyId.unwrap(),
  })
  .partial()
  
