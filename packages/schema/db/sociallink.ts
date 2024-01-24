import * as z from "zod"
import { appTypeSchema } from "./apptype"
import { UserRelations, userRelationsSchema, userBaseSchema } from "./user"
import { LinkRelations, linkRelationsSchema, linkBaseSchema } from "./link"

export const socialLinkBaseSchema = z.object({
  userId: z.string(),
  linkApp: appTypeSchema,
  linkId: z.string(),
  display: z.boolean(),
})

export interface SocialLinkRelations {
  user: z.infer<typeof userBaseSchema> & UserRelations
  link: z.infer<typeof linkBaseSchema> & LinkRelations
}

export const socialLinkRelationsSchema: z.ZodObject<{
  [K in keyof SocialLinkRelations]: z.ZodType<SocialLinkRelations[K]>
}> = z.object({
  user: z.lazy(() => userBaseSchema.merge(userRelationsSchema)),
  link: z.lazy(() => linkBaseSchema.merge(linkRelationsSchema)),
})

export const socialLinkSchema = socialLinkBaseSchema
  .merge(socialLinkRelationsSchema)

export const socialLinkCreateSchema = socialLinkBaseSchema.partial({
  userId: true,
  linkApp: true,
  linkId: true,
  display: true,
})

export const socialLinkUpdateSchema = socialLinkBaseSchema
  .partial()
  
