import * as z from "zod"
import { linkDomainSchema } from "./linkdomain"
import { appTypeSchema } from "./apptype"
import { TeamRelations, teamRelationsSchema, teamBaseSchema } from "./team"
import { TrackRelations, trackRelationsSchema, trackBaseSchema } from "./track"
import { PlaylistRelations, playlistRelationsSchema, playlistBaseSchema } from "./playlist"
import { BioRelations, bioRelationsSchema, bioBaseSchema } from "./bio"
import { ButtonRelations, buttonRelationsSchema, buttonBaseSchema } from "./button"
import { AdCreativeRelations, adCreativeRelationsSchema, adCreativeBaseSchema } from "./adcreative"
import { EventRelations, eventRelationsSchema, eventBaseSchema } from "./event"

export const linkBaseSchema = z.object({
  id: z.string(),
  createdAt: z.date(),
  teamId: z.string(),
  socialForTeamId: z.string().nullable(),
  showSocialForTeam: z.boolean().nullable(),
  handle: z.string(),
  domain: linkDomainSchema,
  slug: z.string().nullable(),
  app: appTypeSchema.nullable(),
  appRoute: z.string().nullable(),
  appId: z.string().nullable(),
  url: z.string(),
  appleScheme: z.string().nullable(),
  androidScheme: z.string().nullable(),
  ogTitle: z.string().nullable(),
  ogDescription: z.string().nullable(),
  ogImage: z.string().nullable(),
  favicon: z.string().nullable(),
  qrLight: z.string().nullable(),
  qrDark: z.string().nullable(),
  qrText: z.string().nullable(),
  qrLogo: z.string().nullable(),
  bioId: z.string().nullable(),
  appLinkId: z.string().nullable(),
  delete: z.boolean().nullable(),
})

export interface LinkRelations {
  team: z.infer<typeof teamBaseSchema> & TeamRelations
  socialForTeam: (z.infer<typeof teamBaseSchema> & TeamRelations) | null
  appleMusicTrack: (z.infer<typeof trackBaseSchema> & TrackRelations) | null
  deezerTrack: (z.infer<typeof trackBaseSchema> & TrackRelations) | null
  soundcloudTrack: (z.infer<typeof trackBaseSchema> & TrackRelations) | null
  spotifyTrack: (z.infer<typeof trackBaseSchema> & TrackRelations) | null
  tidalTrack: (z.infer<typeof trackBaseSchema> & TrackRelations) | null
  youtubeTrack: (z.infer<typeof trackBaseSchema> & TrackRelations) | null
  playlist: (z.infer<typeof playlistBaseSchema> & PlaylistRelations) | null
  bio: (z.infer<typeof bioBaseSchema> & BioRelations) | null
  buttons: (z.infer<typeof buttonBaseSchema> & ButtonRelations)[]
  shortLink: (z.infer<typeof linkBaseSchema> & LinkRelations) | null
  appLink: (z.infer<typeof linkBaseSchema> & LinkRelations) | null
  adCreatives: (z.infer<typeof adCreativeBaseSchema> & AdCreativeRelations)[]
  events: (z.infer<typeof eventBaseSchema> & EventRelations)[]
}

export const linkRelationsSchema: z.ZodObject<{
  [K in keyof LinkRelations]: z.ZodType<LinkRelations[K]>
}> = z.object({
  team: z.lazy(() => teamBaseSchema.merge(teamRelationsSchema)),
  socialForTeam: z.lazy(() => teamBaseSchema.merge(teamRelationsSchema)).nullable(),
  appleMusicTrack: z.lazy(() => trackBaseSchema.merge(trackRelationsSchema)).nullable(),
  deezerTrack: z.lazy(() => trackBaseSchema.merge(trackRelationsSchema)).nullable(),
  soundcloudTrack: z.lazy(() => trackBaseSchema.merge(trackRelationsSchema)).nullable(),
  spotifyTrack: z.lazy(() => trackBaseSchema.merge(trackRelationsSchema)).nullable(),
  tidalTrack: z.lazy(() => trackBaseSchema.merge(trackRelationsSchema)).nullable(),
  youtubeTrack: z.lazy(() => trackBaseSchema.merge(trackRelationsSchema)).nullable(),
  playlist: z.lazy(() => playlistBaseSchema.merge(playlistRelationsSchema)).nullable(),
  bio: z.lazy(() => bioBaseSchema.merge(bioRelationsSchema)).nullable(),
  buttons: z.lazy(() => buttonBaseSchema.merge(buttonRelationsSchema)).array(),
  shortLink: z.lazy(() => linkBaseSchema.merge(linkRelationsSchema)).nullable(),
  appLink: z.lazy(() => linkBaseSchema.merge(linkRelationsSchema)).nullable(),
  adCreatives: z.lazy(() => adCreativeBaseSchema.merge(adCreativeRelationsSchema)).array(),
  events: z.lazy(() => eventBaseSchema.merge(eventRelationsSchema)).array(),
})

export const linkSchema = linkBaseSchema
  .merge(linkRelationsSchema)

export const linkCreateSchema = linkBaseSchema
  .extend({
    socialForTeamId: linkBaseSchema.shape.socialForTeamId.unwrap(),
    showSocialForTeam: linkBaseSchema.shape.showSocialForTeam.unwrap(),
    slug: linkBaseSchema.shape.slug.unwrap(),
    app: linkBaseSchema.shape.app.unwrap(),
    appRoute: linkBaseSchema.shape.appRoute.unwrap(),
    appId: linkBaseSchema.shape.appId.unwrap(),
    appleScheme: linkBaseSchema.shape.appleScheme.unwrap(),
    androidScheme: linkBaseSchema.shape.androidScheme.unwrap(),
    ogTitle: linkBaseSchema.shape.ogTitle.unwrap(),
    ogDescription: linkBaseSchema.shape.ogDescription.unwrap(),
    ogImage: linkBaseSchema.shape.ogImage.unwrap(),
    favicon: linkBaseSchema.shape.favicon.unwrap(),
    qrLight: linkBaseSchema.shape.qrLight.unwrap(),
    qrDark: linkBaseSchema.shape.qrDark.unwrap(),
    qrText: linkBaseSchema.shape.qrText.unwrap(),
    qrLogo: linkBaseSchema.shape.qrLogo.unwrap(),
    bioId: linkBaseSchema.shape.bioId.unwrap(),
    appLinkId: linkBaseSchema.shape.appLinkId.unwrap(),
    delete: linkBaseSchema.shape.delete.unwrap(),
  }).partial({
    id: true,
    createdAt: true,
    teamId: true,
    socialForTeam: true,
    socialForTeamId: true,
    showSocialForTeam: true,
    domain: true,
    slug: true,
    app: true,
    appRoute: true,
    appId: true,
    appleScheme: true,
    androidScheme: true,
    ogTitle: true,
    ogDescription: true,
    ogImage: true,
    favicon: true,
    qrLight: true,
    qrDark: true,
    qrText: true,
    qrLogo: true,
    appleMusicTrack: true,
    deezerTrack: true,
    soundcloudTrack: true,
    spotifyTrack: true,
    tidalTrack: true,
    youtubeTrack: true,
    playlist: true,
    bio: true,
    bioId: true,
    buttons: true,
    shortLink: true,
    appLink: true,
    appLinkId: true,
    adCreatives: true,
    events: true,
    delete: true,
  })

export const linkUpdateSchema = linkBaseSchema
  .extend({
    socialForTeamId: linkBaseSchema.shape.socialForTeamId.unwrap(),
    showSocialForTeam: linkBaseSchema.shape.showSocialForTeam.unwrap(),
    slug: linkBaseSchema.shape.slug.unwrap(),
    app: linkBaseSchema.shape.app.unwrap(),
    appRoute: linkBaseSchema.shape.appRoute.unwrap(),
    appId: linkBaseSchema.shape.appId.unwrap(),
    appleScheme: linkBaseSchema.shape.appleScheme.unwrap(),
    androidScheme: linkBaseSchema.shape.androidScheme.unwrap(),
    ogTitle: linkBaseSchema.shape.ogTitle.unwrap(),
    ogDescription: linkBaseSchema.shape.ogDescription.unwrap(),
    ogImage: linkBaseSchema.shape.ogImage.unwrap(),
    favicon: linkBaseSchema.shape.favicon.unwrap(),
    qrLight: linkBaseSchema.shape.qrLight.unwrap(),
    qrDark: linkBaseSchema.shape.qrDark.unwrap(),
    qrText: linkBaseSchema.shape.qrText.unwrap(),
    qrLogo: linkBaseSchema.shape.qrLogo.unwrap(),
    bioId: linkBaseSchema.shape.bioId.unwrap(),
    appLinkId: linkBaseSchema.shape.appLinkId.unwrap(),
    delete: linkBaseSchema.shape.delete.unwrap(),
  })
  .partial()
  
