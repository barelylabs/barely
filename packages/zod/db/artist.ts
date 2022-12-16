import * as z from "zod"
import { UserRelations, userRelationsSchema, userBaseSchema } from "./user"
import { ArtistAccountRelations, artistAccountRelationsSchema, artistAccountBaseSchema } from "./artistaccount"
import { PlaylistRelations, playlistRelationsSchema, playlistBaseSchema } from "./playlist"
import { TrackRelations, trackRelationsSchema, trackBaseSchema } from "./track"
import { FileRelations, fileRelationsSchema, fileBaseSchema } from "./file"
import { VidRenderRelations, vidRenderRelationsSchema, vidRenderBaseSchema } from "./vidrender"
import { PlaylistCoverRenderRelations, playlistCoverRenderRelationsSchema, playlistCoverRenderBaseSchema } from "./playlistcoverrender"
import { BioRelations, bioRelationsSchema, bioBaseSchema } from "./bio"
import { ButtonRelations, buttonRelationsSchema, buttonBaseSchema } from "./button"
import { FormRelations, formRelationsSchema, formBaseSchema } from "./form"
import { LinkRelations, linkRelationsSchema, linkBaseSchema } from "./link"
import { ArtistSocialLinkRelations, artistSocialLinkRelationsSchema, artistSocialLinkBaseSchema } from "./artistsociallink"
import { ArtistAnalyticsEndpointRelations, artistAnalyticsEndpointRelationsSchema, artistAnalyticsEndpointBaseSchema } from "./artistanalyticsendpoint"
import { ExternalWebsiteRelations, externalWebsiteRelationsSchema, externalWebsiteBaseSchema } from "./externalwebsite"
import { CampaignRelations, campaignRelationsSchema, campaignBaseSchema } from "./campaign"
import { AudienceRelations, audienceRelationsSchema, audienceBaseSchema } from "./audience"
import { AdCreativeRelations, adCreativeRelationsSchema, adCreativeBaseSchema } from "./adcreative"
import { EpicRelations, epicRelationsSchema, epicBaseSchema } from "./epic"
import { StoryRelations, storyRelationsSchema, storyBaseSchema } from "./story"
import { TaskRelations, taskRelationsSchema, taskBaseSchema } from "./task"

export const artistBaseSchema = z.object({
  id: z.string(),
  handle: z.string(),
  name: z.string(),
  userId: z.string(),
})

export interface ArtistRelations {
  user: z.infer<typeof userBaseSchema> & UserRelations
  accounts: (z.infer<typeof artistAccountBaseSchema> & ArtistAccountRelations)[]
  playlists: (z.infer<typeof playlistBaseSchema> & PlaylistRelations)[]
  tracks: (z.infer<typeof trackBaseSchema> & TrackRelations)[]
  files: (z.infer<typeof fileBaseSchema> & FileRelations)[]
  vidRenders: (z.infer<typeof vidRenderBaseSchema> & VidRenderRelations)[]
  playlistCoverRenders: (z.infer<typeof playlistCoverRenderBaseSchema> & PlaylistCoverRenderRelations)[]
  bios: (z.infer<typeof bioBaseSchema> & BioRelations)[]
  rootBio: (z.infer<typeof bioBaseSchema> & BioRelations) | null
  buttons: (z.infer<typeof buttonBaseSchema> & ButtonRelations)[]
  forms: (z.infer<typeof formBaseSchema> & FormRelations)[]
  links: (z.infer<typeof linkBaseSchema> & LinkRelations)[]
  socialLinks: (z.infer<typeof artistSocialLinkBaseSchema> & ArtistSocialLinkRelations)[]
  analytics: (z.infer<typeof artistAnalyticsEndpointBaseSchema> & ArtistAnalyticsEndpointRelations)[]
  externalWebsites: (z.infer<typeof externalWebsiteBaseSchema> & ExternalWebsiteRelations)[]
  campaigns: (z.infer<typeof campaignBaseSchema> & CampaignRelations)[]
  audiences: (z.infer<typeof audienceBaseSchema> & AudienceRelations)[]
  adCreatives: (z.infer<typeof adCreativeBaseSchema> & AdCreativeRelations)[]
  epics: (z.infer<typeof epicBaseSchema> & EpicRelations)[]
  stories: (z.infer<typeof storyBaseSchema> & StoryRelations)[]
  tasks: (z.infer<typeof taskBaseSchema> & TaskRelations)[]
}

export const artistRelationsSchema: z.ZodObject<{
  [K in keyof ArtistRelations]: z.ZodType<ArtistRelations[K]>
}> = z.object({
  user: z.lazy(() => userBaseSchema.merge(userRelationsSchema)),
  accounts: z.lazy(() => artistAccountBaseSchema.merge(artistAccountRelationsSchema)).array(),
  playlists: z.lazy(() => playlistBaseSchema.merge(playlistRelationsSchema)).array(),
  tracks: z.lazy(() => trackBaseSchema.merge(trackRelationsSchema)).array(),
  files: z.lazy(() => fileBaseSchema.merge(fileRelationsSchema)).array(),
  vidRenders: z.lazy(() => vidRenderBaseSchema.merge(vidRenderRelationsSchema)).array(),
  playlistCoverRenders: z.lazy(() => playlistCoverRenderBaseSchema.merge(playlistCoverRenderRelationsSchema)).array(),
  bios: z.lazy(() => bioBaseSchema.merge(bioRelationsSchema)).array(),
  rootBio: z.lazy(() => bioBaseSchema.merge(bioRelationsSchema)).nullable(),
  buttons: z.lazy(() => buttonBaseSchema.merge(buttonRelationsSchema)).array(),
  forms: z.lazy(() => formBaseSchema.merge(formRelationsSchema)).array(),
  links: z.lazy(() => linkBaseSchema.merge(linkRelationsSchema)).array(),
  socialLinks: z.lazy(() => artistSocialLinkBaseSchema.merge(artistSocialLinkRelationsSchema)).array(),
  analytics: z.lazy(() => artistAnalyticsEndpointBaseSchema.merge(artistAnalyticsEndpointRelationsSchema)).array(),
  externalWebsites: z.lazy(() => externalWebsiteBaseSchema.merge(externalWebsiteRelationsSchema)).array(),
  campaigns: z.lazy(() => campaignBaseSchema.merge(campaignRelationsSchema)).array(),
  audiences: z.lazy(() => audienceBaseSchema.merge(audienceRelationsSchema)).array(),
  adCreatives: z.lazy(() => adCreativeBaseSchema.merge(adCreativeRelationsSchema)).array(),
  epics: z.lazy(() => epicBaseSchema.merge(epicRelationsSchema)).array(),
  stories: z.lazy(() => storyBaseSchema.merge(storyRelationsSchema)).array(),
  tasks: z.lazy(() => taskBaseSchema.merge(taskRelationsSchema)).array(),
})

export const artistSchema = artistBaseSchema
  .merge(artistRelationsSchema)

export const artistCreateSchema = artistBaseSchema.partial({
  id: true,
  userId: true,
  accounts: true,
  playlists: true,
  tracks: true,
  files: true,
  vidRenders: true,
  playlistCoverRenders: true,
  bios: true,
  rootBio: true,
  buttons: true,
  forms: true,
  links: true,
  socialLinks: true,
  analytics: true,
  externalWebsites: true,
  campaigns: true,
  audiences: true,
  adCreatives: true,
  epics: true,
  stories: true,
  tasks: true,
})

export const artistUpdateSchema = artistBaseSchema
  .partial()
  
