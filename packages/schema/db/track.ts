import * as z from "zod"
import { TeamRelations, teamRelationsSchema, teamBaseSchema } from "./team"
import { FileRelations, fileRelationsSchema, fileBaseSchema } from "./file"
import { TrackRenderRelations, trackRenderRelationsSchema, trackRenderBaseSchema } from "./trackrender"
import { LinkRelations, linkRelationsSchema, linkBaseSchema } from "./link"
import { CampaignRelations, campaignRelationsSchema, campaignBaseSchema } from "./campaign"
import { StatRelations, statRelationsSchema, statBaseSchema } from "./stat"

export const trackBaseSchema = z.object({
  id: z.string(),
  name: z.string(),
  teamId: z.string(),
  isrc: z.string().nullable(),
  appleMusicId: z.string().nullable(),
  deezerId: z.string().nullable(),
  soundcloudId: z.string().nullable(),
  spotifyId: z.string().nullable(),
  tidalId: z.string().nullable(),
  youtubeId: z.string().nullable(),
  released: z.boolean(),
  releaseDate: z.date().nullable(),
  masterMp3Id: z.string().nullable(),
  masterWavId: z.string().nullable(),
  appleMusicLinkId: z.string().nullable(),
  deezerLinkId: z.string().nullable(),
  soundcloudLinkId: z.string().nullable(),
  spotifyLinkId: z.string().nullable(),
  tidalLinkId: z.string().nullable(),
  youtubeLinkId: z.string().nullable(),
})

export interface TrackRelations {
  team: z.infer<typeof teamBaseSchema> & TeamRelations
  masterMp3: (z.infer<typeof fileBaseSchema> & FileRelations) | null
  masterWav: (z.infer<typeof fileBaseSchema> & FileRelations) | null
  vids: (z.infer<typeof fileBaseSchema> & FileRelations)[]
  trackRenders: (z.infer<typeof trackRenderBaseSchema> & TrackRenderRelations)[]
  appleMusicLink: (z.infer<typeof linkBaseSchema> & LinkRelations) | null
  deezerLink: (z.infer<typeof linkBaseSchema> & LinkRelations) | null
  soundcloudLink: (z.infer<typeof linkBaseSchema> & LinkRelations) | null
  spotifyLink: (z.infer<typeof linkBaseSchema> & LinkRelations) | null
  tidalLink: (z.infer<typeof linkBaseSchema> & LinkRelations) | null
  youtubeLink: (z.infer<typeof linkBaseSchema> & LinkRelations) | null
  campaigns: (z.infer<typeof campaignBaseSchema> & CampaignRelations)[]
  stats: (z.infer<typeof statBaseSchema> & StatRelations)[]
}

export const trackRelationsSchema: z.ZodObject<{
  [K in keyof TrackRelations]: z.ZodType<TrackRelations[K]>
}> = z.object({
  team: z.lazy(() => teamBaseSchema.merge(teamRelationsSchema)),
  masterMp3: z.lazy(() => fileBaseSchema.merge(fileRelationsSchema)).nullable(),
  masterWav: z.lazy(() => fileBaseSchema.merge(fileRelationsSchema)).nullable(),
  vids: z.lazy(() => fileBaseSchema.merge(fileRelationsSchema)).array(),
  trackRenders: z.lazy(() => trackRenderBaseSchema.merge(trackRenderRelationsSchema)).array(),
  appleMusicLink: z.lazy(() => linkBaseSchema.merge(linkRelationsSchema)).nullable(),
  deezerLink: z.lazy(() => linkBaseSchema.merge(linkRelationsSchema)).nullable(),
  soundcloudLink: z.lazy(() => linkBaseSchema.merge(linkRelationsSchema)).nullable(),
  spotifyLink: z.lazy(() => linkBaseSchema.merge(linkRelationsSchema)).nullable(),
  tidalLink: z.lazy(() => linkBaseSchema.merge(linkRelationsSchema)).nullable(),
  youtubeLink: z.lazy(() => linkBaseSchema.merge(linkRelationsSchema)).nullable(),
  campaigns: z.lazy(() => campaignBaseSchema.merge(campaignRelationsSchema)).array(),
  stats: z.lazy(() => statBaseSchema.merge(statRelationsSchema)).array(),
})

export const trackSchema = trackBaseSchema
  .merge(trackRelationsSchema)

export const trackCreateSchema = trackBaseSchema
  .extend({
    isrc: trackBaseSchema.shape.isrc.unwrap(),
    appleMusicId: trackBaseSchema.shape.appleMusicId.unwrap(),
    deezerId: trackBaseSchema.shape.deezerId.unwrap(),
    soundcloudId: trackBaseSchema.shape.soundcloudId.unwrap(),
    spotifyId: trackBaseSchema.shape.spotifyId.unwrap(),
    tidalId: trackBaseSchema.shape.tidalId.unwrap(),
    youtubeId: trackBaseSchema.shape.youtubeId.unwrap(),
    releaseDate: trackBaseSchema.shape.releaseDate.unwrap(),
    masterMp3Id: trackBaseSchema.shape.masterMp3Id.unwrap(),
    masterWavId: trackBaseSchema.shape.masterWavId.unwrap(),
    appleMusicLinkId: trackBaseSchema.shape.appleMusicLinkId.unwrap(),
    deezerLinkId: trackBaseSchema.shape.deezerLinkId.unwrap(),
    soundcloudLinkId: trackBaseSchema.shape.soundcloudLinkId.unwrap(),
    spotifyLinkId: trackBaseSchema.shape.spotifyLinkId.unwrap(),
    tidalLinkId: trackBaseSchema.shape.tidalLinkId.unwrap(),
    youtubeLinkId: trackBaseSchema.shape.youtubeLinkId.unwrap(),
  }).partial({
    id: true,
    teamId: true,
    isrc: true,
    appleMusicId: true,
    deezerId: true,
    soundcloudId: true,
    spotifyId: true,
    tidalId: true,
    youtubeId: true,
    releaseDate: true,
    masterMp3: true,
    masterMp3Id: true,
    masterWav: true,
    masterWavId: true,
    vids: true,
    trackRenders: true,
    appleMusicLink: true,
    appleMusicLinkId: true,
    deezerLink: true,
    deezerLinkId: true,
    soundcloudLink: true,
    soundcloudLinkId: true,
    spotifyLink: true,
    spotifyLinkId: true,
    tidalLink: true,
    tidalLinkId: true,
    youtubeLink: true,
    youtubeLinkId: true,
    campaigns: true,
    stats: true,
  })

export const trackUpdateSchema = trackBaseSchema
  .extend({
    isrc: trackBaseSchema.shape.isrc.unwrap(),
    appleMusicId: trackBaseSchema.shape.appleMusicId.unwrap(),
    deezerId: trackBaseSchema.shape.deezerId.unwrap(),
    soundcloudId: trackBaseSchema.shape.soundcloudId.unwrap(),
    spotifyId: trackBaseSchema.shape.spotifyId.unwrap(),
    tidalId: trackBaseSchema.shape.tidalId.unwrap(),
    youtubeId: trackBaseSchema.shape.youtubeId.unwrap(),
    releaseDate: trackBaseSchema.shape.releaseDate.unwrap(),
    masterMp3Id: trackBaseSchema.shape.masterMp3Id.unwrap(),
    masterWavId: trackBaseSchema.shape.masterWavId.unwrap(),
    appleMusicLinkId: trackBaseSchema.shape.appleMusicLinkId.unwrap(),
    deezerLinkId: trackBaseSchema.shape.deezerLinkId.unwrap(),
    soundcloudLinkId: trackBaseSchema.shape.soundcloudLinkId.unwrap(),
    spotifyLinkId: trackBaseSchema.shape.spotifyLinkId.unwrap(),
    tidalLinkId: trackBaseSchema.shape.tidalLinkId.unwrap(),
    youtubeLinkId: trackBaseSchema.shape.youtubeLinkId.unwrap(),
  })
  .partial()
  
