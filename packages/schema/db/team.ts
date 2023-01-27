import * as z from "zod"
import { TeamMemberRelations, teamMemberRelationsSchema, teamMemberBaseSchema } from "./teammember"
import { AccountRelations, accountRelationsSchema, accountBaseSchema } from "./account"
import { LinkRelations, linkRelationsSchema, linkBaseSchema } from "./link"
import { AnalyticsEndpointRelations, analyticsEndpointRelationsSchema, analyticsEndpointBaseSchema } from "./analyticsendpoint"
import { ExternalWebsiteRelations, externalWebsiteRelationsSchema, externalWebsiteBaseSchema } from "./externalwebsite"
import { BioRelations, bioRelationsSchema, bioBaseSchema } from "./bio"
import { ButtonRelations, buttonRelationsSchema, buttonBaseSchema } from "./button"
import { FormRelations, formRelationsSchema, formBaseSchema } from "./form"
import { CampaignRelations, campaignRelationsSchema, campaignBaseSchema } from "./campaign"
import { AdCreativeRelations, adCreativeRelationsSchema, adCreativeBaseSchema } from "./adcreative"
import { AudienceRelations, audienceRelationsSchema, audienceBaseSchema } from "./audience"
import { DemoRelations, demoRelationsSchema, demoBaseSchema } from "./demo"
import { GeoGroupRelations, geoGroupRelationsSchema, geoGroupBaseSchema } from "./geogroup"
import { InterestGroupRelations, interestGroupRelationsSchema, interestGroupBaseSchema } from "./interestgroup"
import { VidViewsGroupRelations, vidViewsGroupRelationsSchema, vidViewsGroupBaseSchema } from "./vidviewsgroup"
import { EpicRelations, epicRelationsSchema, epicBaseSchema } from "./epic"
import { StoryBoardRelations, storyBoardRelationsSchema, storyBoardBaseSchema } from "./storyboard"
import { TaskRelations, taskRelationsSchema, taskBaseSchema } from "./task"
import { TrackRelations, trackRelationsSchema, trackBaseSchema } from "./track"
import { PlaylistRelations, playlistRelationsSchema, playlistBaseSchema } from "./playlist"
import { FileRelations, fileRelationsSchema, fileBaseSchema } from "./file"
import { TrackRenderRelations, trackRenderRelationsSchema, trackRenderBaseSchema } from "./trackrender"
import { VidRenderRelations, vidRenderRelationsSchema, vidRenderBaseSchema } from "./vidrender"
import { PlaylistCoverRenderRelations, playlistCoverRenderRelationsSchema, playlistCoverRenderBaseSchema } from "./playlistcoverrender"

export const teamBaseSchema = z.object({
  id: z.string(),
  name: z.string(),
  handle: z.string(),
  createdAt: z.date(),
})

export interface TeamRelations {
  users: (z.infer<typeof teamMemberBaseSchema> & TeamMemberRelations)[]
  externalAccounts: (z.infer<typeof accountBaseSchema> & AccountRelations)[]
  defaultAccounts: (z.infer<typeof accountBaseSchema> & AccountRelations)[]
  links: (z.infer<typeof linkBaseSchema> & LinkRelations)[]
  socialLinks: (z.infer<typeof linkBaseSchema> & LinkRelations)[]
  analyticsEndpoints: (z.infer<typeof analyticsEndpointBaseSchema> & AnalyticsEndpointRelations)[]
  externalWebsites: (z.infer<typeof externalWebsiteBaseSchema> & ExternalWebsiteRelations)[]
  bios: (z.infer<typeof bioBaseSchema> & BioRelations)[]
  rootBio: (z.infer<typeof bioBaseSchema> & BioRelations) | null
  buttons: (z.infer<typeof buttonBaseSchema> & ButtonRelations)[]
  forms: (z.infer<typeof formBaseSchema> & FormRelations)[]
  campaigns: (z.infer<typeof campaignBaseSchema> & CampaignRelations)[]
  adCreatives: (z.infer<typeof adCreativeBaseSchema> & AdCreativeRelations)[]
  audiences: (z.infer<typeof audienceBaseSchema> & AudienceRelations)[]
  demos: (z.infer<typeof demoBaseSchema> & DemoRelations)[]
  geoGroups: (z.infer<typeof geoGroupBaseSchema> & GeoGroupRelations)[]
  interestGroups: (z.infer<typeof interestGroupBaseSchema> & InterestGroupRelations)[]
  vidViewsGroups: (z.infer<typeof vidViewsGroupBaseSchema> & VidViewsGroupRelations)[]
  epics: (z.infer<typeof epicBaseSchema> & EpicRelations)[]
  storyBoards: (z.infer<typeof storyBoardBaseSchema> & StoryBoardRelations)[]
  tasks: (z.infer<typeof taskBaseSchema> & TaskRelations)[]
  tracks: (z.infer<typeof trackBaseSchema> & TrackRelations)[]
  playlists: (z.infer<typeof playlistBaseSchema> & PlaylistRelations)[]
  files: (z.infer<typeof fileBaseSchema> & FileRelations)[]
  trackRenders: (z.infer<typeof trackRenderBaseSchema> & TrackRenderRelations)[]
  vidRenders: (z.infer<typeof vidRenderBaseSchema> & VidRenderRelations)[]
  playlistCoverRenders: (z.infer<typeof playlistCoverRenderBaseSchema> & PlaylistCoverRenderRelations)[]
}

export const teamRelationsSchema: z.ZodObject<{
  [K in keyof TeamRelations]: z.ZodType<TeamRelations[K]>
}> = z.object({
  users: z.lazy(() => teamMemberBaseSchema.merge(teamMemberRelationsSchema)).array(),
  externalAccounts: z.lazy(() => accountBaseSchema.merge(accountRelationsSchema)).array(),
  defaultAccounts: z.lazy(() => accountBaseSchema.merge(accountRelationsSchema)).array(),
  links: z.lazy(() => linkBaseSchema.merge(linkRelationsSchema)).array(),
  socialLinks: z.lazy(() => linkBaseSchema.merge(linkRelationsSchema)).array(),
  analyticsEndpoints: z.lazy(() => analyticsEndpointBaseSchema.merge(analyticsEndpointRelationsSchema)).array(),
  externalWebsites: z.lazy(() => externalWebsiteBaseSchema.merge(externalWebsiteRelationsSchema)).array(),
  bios: z.lazy(() => bioBaseSchema.merge(bioRelationsSchema)).array(),
  rootBio: z.lazy(() => bioBaseSchema.merge(bioRelationsSchema)).nullable(),
  buttons: z.lazy(() => buttonBaseSchema.merge(buttonRelationsSchema)).array(),
  forms: z.lazy(() => formBaseSchema.merge(formRelationsSchema)).array(),
  campaigns: z.lazy(() => campaignBaseSchema.merge(campaignRelationsSchema)).array(),
  adCreatives: z.lazy(() => adCreativeBaseSchema.merge(adCreativeRelationsSchema)).array(),
  audiences: z.lazy(() => audienceBaseSchema.merge(audienceRelationsSchema)).array(),
  demos: z.lazy(() => demoBaseSchema.merge(demoRelationsSchema)).array(),
  geoGroups: z.lazy(() => geoGroupBaseSchema.merge(geoGroupRelationsSchema)).array(),
  interestGroups: z.lazy(() => interestGroupBaseSchema.merge(interestGroupRelationsSchema)).array(),
  vidViewsGroups: z.lazy(() => vidViewsGroupBaseSchema.merge(vidViewsGroupRelationsSchema)).array(),
  epics: z.lazy(() => epicBaseSchema.merge(epicRelationsSchema)).array(),
  storyBoards: z.lazy(() => storyBoardBaseSchema.merge(storyBoardRelationsSchema)).array(),
  tasks: z.lazy(() => taskBaseSchema.merge(taskRelationsSchema)).array(),
  tracks: z.lazy(() => trackBaseSchema.merge(trackRelationsSchema)).array(),
  playlists: z.lazy(() => playlistBaseSchema.merge(playlistRelationsSchema)).array(),
  files: z.lazy(() => fileBaseSchema.merge(fileRelationsSchema)).array(),
  trackRenders: z.lazy(() => trackRenderBaseSchema.merge(trackRenderRelationsSchema)).array(),
  vidRenders: z.lazy(() => vidRenderBaseSchema.merge(vidRenderRelationsSchema)).array(),
  playlistCoverRenders: z.lazy(() => playlistCoverRenderBaseSchema.merge(playlistCoverRenderRelationsSchema)).array(),
})

export const teamSchema = teamBaseSchema
  .merge(teamRelationsSchema)

export const teamCreateSchema = teamBaseSchema.partial({
  id: true,
  createdAt: true,
  users: true,
  externalAccounts: true,
  defaultAccounts: true,
  links: true,
  socialLinks: true,
  analyticsEndpoints: true,
  externalWebsites: true,
  bios: true,
  rootBio: true,
  buttons: true,
  forms: true,
  campaigns: true,
  adCreatives: true,
  audiences: true,
  demos: true,
  geoGroups: true,
  interestGroups: true,
  vidViewsGroups: true,
  epics: true,
  storyBoards: true,
  tasks: true,
  tracks: true,
  playlists: true,
  files: true,
  trackRenders: true,
  vidRenders: true,
  playlistCoverRenders: true,
})

export const teamUpdateSchema = teamBaseSchema
  .partial()
  
