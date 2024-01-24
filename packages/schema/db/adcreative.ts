import * as z from "zod"
import { TeamRelations, teamRelationsSchema, teamBaseSchema } from "./team"
import { AccountRelations, accountRelationsSchema, accountBaseSchema } from "./account"
import { HeadlineRelations, headlineRelationsSchema, headlineBaseSchema } from "./headline"
import { FileRelations, fileRelationsSchema, fileBaseSchema } from "./file"
import { LinkRelations, linkRelationsSchema, linkBaseSchema } from "./link"
import { AdRelations, adRelationsSchema, adBaseSchema } from "./ad"

export const adCreativeBaseSchema = z.object({
  id: z.string(),
  name: z.string(),
  createdAt: z.date(),
  teamId: z.string(),
  metaAccountId: z.string(),
  tikTokAccountId: z.string().nullable(),
  metaId: z.string().nullable(),
  metaPostId: z.string().nullable(),
  tikTokId: z.string().nullable(),
  headlineId: z.string().nullable(),
  callToActionType: z.string().nullable(),
  linkId: z.string(),
  linkCaption: z.string().nullable(),
  urlTags: z.string().nullable(),
})

export interface AdCreativeRelations {
  team: z.infer<typeof teamBaseSchema> & TeamRelations
  metaAccount: z.infer<typeof accountBaseSchema> & AccountRelations
  tikTokAccount: (z.infer<typeof accountBaseSchema> & AccountRelations) | null
  headline: (z.infer<typeof headlineBaseSchema> & HeadlineRelations) | null
  vids: (z.infer<typeof fileBaseSchema> & FileRelations)[]
  link: z.infer<typeof linkBaseSchema> & LinkRelations
  ads: (z.infer<typeof adBaseSchema> & AdRelations)[]
}

export const adCreativeRelationsSchema: z.ZodObject<{
  [K in keyof AdCreativeRelations]: z.ZodType<AdCreativeRelations[K]>
}> = z.object({
  team: z.lazy(() => teamBaseSchema.merge(teamRelationsSchema)),
  metaAccount: z.lazy(() => accountBaseSchema.merge(accountRelationsSchema)),
  tikTokAccount: z.lazy(() => accountBaseSchema.merge(accountRelationsSchema)).nullable(),
  headline: z.lazy(() => headlineBaseSchema.merge(headlineRelationsSchema)).nullable(),
  vids: z.lazy(() => fileBaseSchema.merge(fileRelationsSchema)).array(),
  link: z.lazy(() => linkBaseSchema.merge(linkRelationsSchema)),
  ads: z.lazy(() => adBaseSchema.merge(adRelationsSchema)).array(),
})

export const adCreativeSchema = adCreativeBaseSchema
  .merge(adCreativeRelationsSchema)

export const adCreativeCreateSchema = adCreativeBaseSchema
  .extend({
    tikTokAccountId: adCreativeBaseSchema.shape.tikTokAccountId.unwrap(),
    metaId: adCreativeBaseSchema.shape.metaId.unwrap(),
    metaPostId: adCreativeBaseSchema.shape.metaPostId.unwrap(),
    tikTokId: adCreativeBaseSchema.shape.tikTokId.unwrap(),
    headlineId: adCreativeBaseSchema.shape.headlineId.unwrap(),
    callToActionType: adCreativeBaseSchema.shape.callToActionType.unwrap(),
    linkCaption: adCreativeBaseSchema.shape.linkCaption.unwrap(),
    urlTags: adCreativeBaseSchema.shape.urlTags.unwrap(),
  }).partial({
    id: true,
    createdAt: true,
    teamId: true,
    metaAccountId: true,
    tikTokAccount: true,
    tikTokAccountId: true,
    metaId: true,
    metaPostId: true,
    tikTokId: true,
    headline: true,
    headlineId: true,
    vids: true,
    callToActionType: true,
    linkId: true,
    linkCaption: true,
    urlTags: true,
    ads: true,
  })

export const adCreativeUpdateSchema = adCreativeBaseSchema
  .extend({
    tikTokAccountId: adCreativeBaseSchema.shape.tikTokAccountId.unwrap(),
    metaId: adCreativeBaseSchema.shape.metaId.unwrap(),
    metaPostId: adCreativeBaseSchema.shape.metaPostId.unwrap(),
    tikTokId: adCreativeBaseSchema.shape.tikTokId.unwrap(),
    headlineId: adCreativeBaseSchema.shape.headlineId.unwrap(),
    callToActionType: adCreativeBaseSchema.shape.callToActionType.unwrap(),
    linkCaption: adCreativeBaseSchema.shape.linkCaption.unwrap(),
    urlTags: adCreativeBaseSchema.shape.urlTags.unwrap(),
  })
  .partial()
  
