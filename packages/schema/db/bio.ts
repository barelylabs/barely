import * as z from "zod"
import { bioImgShapeSchema } from "./bioimgshape"
import { bioThemeSchema } from "./biotheme"
import { UserRelations, userRelationsSchema, userBaseSchema } from "./user"
import { LinkRelations, linkRelationsSchema, linkBaseSchema } from "./link"
import { EventRelations, eventRelationsSchema, eventBaseSchema } from "./event"
import { BioButtonRelations, bioButtonRelationsSchema, bioButtonBaseSchema } from "./biobutton"

export const bioBaseSchema = z.object({
  id: z.string(),
  createdAt: z.date(),
  userId: z.string(),
  rootForUserId: z.string().nullable(),
  handle: z.string(),
  route: z.string().nullable(),
  slug: z.string().nullable(),
  img: z.string().nullable(),
  imgShape: bioImgShapeSchema.nullable(),
  title: z.string().nullable(),
  subtitle: z.string().nullable(),
  titleColor: z.string().nullable(),
  buttonColor: z.string().nullable(),
  iconColor: z.string().nullable(),
  textColor: z.string().nullable(),
  socialDisplay: z.boolean(),
  socialButtonColor: z.string().nullable(),
  socialIconColor: z.string().nullable(),
  theme: bioThemeSchema,
  barelyBranding: z.boolean(),
})

export interface BioRelations {
  user: z.infer<typeof userBaseSchema> & UserRelations
  rootForUser: (z.infer<typeof userBaseSchema> & UserRelations) | null
  link: (z.infer<typeof linkBaseSchema> & LinkRelations) | null
  events: (z.infer<typeof eventBaseSchema> & EventRelations)[]
  buttons: (z.infer<typeof bioButtonBaseSchema> & BioButtonRelations)[]
}

export const bioRelationsSchema: z.ZodObject<{
  [K in keyof BioRelations]: z.ZodType<BioRelations[K]>
}> = z.object({
  user: z.lazy(() => userBaseSchema.merge(userRelationsSchema)),
  rootForUser: z.lazy(() => userBaseSchema.merge(userRelationsSchema)).nullable(),
  link: z.lazy(() => linkBaseSchema.merge(linkRelationsSchema)).nullable(),
  events: z.lazy(() => eventBaseSchema.merge(eventRelationsSchema)).array(),
  buttons: z.lazy(() => bioButtonBaseSchema.merge(bioButtonRelationsSchema)).array(),
})

export const bioSchema = bioBaseSchema
  .merge(bioRelationsSchema)

export const bioCreateSchema = bioBaseSchema
  .extend({
    rootForUserId: bioBaseSchema.shape.rootForUserId.unwrap(),
    route: bioBaseSchema.shape.route.unwrap(),
    slug: bioBaseSchema.shape.slug.unwrap(),
    img: bioBaseSchema.shape.img.unwrap(),
    imgShape: bioBaseSchema.shape.imgShape.unwrap(),
    title: bioBaseSchema.shape.title.unwrap(),
    subtitle: bioBaseSchema.shape.subtitle.unwrap(),
    titleColor: bioBaseSchema.shape.titleColor.unwrap(),
    buttonColor: bioBaseSchema.shape.buttonColor.unwrap(),
    iconColor: bioBaseSchema.shape.iconColor.unwrap(),
    textColor: bioBaseSchema.shape.textColor.unwrap(),
    socialButtonColor: bioBaseSchema.shape.socialButtonColor.unwrap(),
    socialIconColor: bioBaseSchema.shape.socialIconColor.unwrap(),
  }).partial({
    id: true,
    createdAt: true,
    userId: true,
    rootForUser: true,
    rootForUserId: true,
    handle: true,
    route: true,
    slug: true,
    link: true,
    events: true,
    img: true,
    imgShape: true,
    title: true,
    subtitle: true,
    titleColor: true,
    buttons: true,
    buttonColor: true,
    iconColor: true,
    textColor: true,
    socialButtonColor: true,
    socialIconColor: true,
    barelyBranding: true,
  })

export const bioUpdateSchema = bioBaseSchema
  .extend({
    rootForUserId: bioBaseSchema.shape.rootForUserId.unwrap(),
    route: bioBaseSchema.shape.route.unwrap(),
    slug: bioBaseSchema.shape.slug.unwrap(),
    img: bioBaseSchema.shape.img.unwrap(),
    imgShape: bioBaseSchema.shape.imgShape.unwrap(),
    title: bioBaseSchema.shape.title.unwrap(),
    subtitle: bioBaseSchema.shape.subtitle.unwrap(),
    titleColor: bioBaseSchema.shape.titleColor.unwrap(),
    buttonColor: bioBaseSchema.shape.buttonColor.unwrap(),
    iconColor: bioBaseSchema.shape.iconColor.unwrap(),
    textColor: bioBaseSchema.shape.textColor.unwrap(),
    socialButtonColor: bioBaseSchema.shape.socialButtonColor.unwrap(),
    socialIconColor: bioBaseSchema.shape.socialIconColor.unwrap(),
  })
  .partial()
  
