import * as z from "zod"
import { formPlatformSchema } from "./formplatform"
import { EventRelations, eventRelationsSchema, eventBaseSchema } from "./event"
import { ButtonRelations, buttonRelationsSchema, buttonBaseSchema } from "./button"
import { FormResponseRelations, formResponseRelationsSchema, formResponseBaseSchema } from "./formresponse"
import { ArtistRelations, artistRelationsSchema, artistBaseSchema } from "./artist"

export const formBaseSchema = z.object({
  id: z.string(),
  platform: formPlatformSchema,
  title: z.string().nullable(),
  subtitle: z.string().nullable(),
  messagePrompt: z.string().nullable(),
  forwardingEmail: z.string().email(),
  forwardingCc: z.string(),
  inputName: z.boolean(),
  inputEmail: z.boolean(),
  inputPhone: z.boolean(),
  inputMessage: z.boolean(),
  artistId: z.string().nullable(),
})

export interface FormRelations {
  events: (z.infer<typeof eventBaseSchema> & EventRelations)[]
  buttons: (z.infer<typeof buttonBaseSchema> & ButtonRelations)[]
  responses: (z.infer<typeof formResponseBaseSchema> & FormResponseRelations)[]
  artist: (z.infer<typeof artistBaseSchema> & ArtistRelations) | null
}

export const formRelationsSchema: z.ZodObject<{
  [K in keyof FormRelations]: z.ZodType<FormRelations[K]>
}> = z.object({
  events: z.lazy(() => eventBaseSchema.merge(eventRelationsSchema)).array(),
  buttons: z.lazy(() => buttonBaseSchema.merge(buttonRelationsSchema)).array(),
  responses: z.lazy(() => formResponseBaseSchema.merge(formResponseRelationsSchema)).array(),
  artist: z.lazy(() => artistBaseSchema.merge(artistRelationsSchema)).nullable(),
})

export const formSchema = formBaseSchema
  .merge(formRelationsSchema)

export const formCreateSchema = formBaseSchema
  .extend({
    title: formBaseSchema.shape.title.unwrap(),
    subtitle: formBaseSchema.shape.subtitle.unwrap(),
    messagePrompt: formBaseSchema.shape.messagePrompt.unwrap(),
    artistId: formBaseSchema.shape.artistId.unwrap(),
  }).partial({
    id: true,
    title: true,
    subtitle: true,
    messagePrompt: true,
    events: true,
    buttons: true,
    responses: true,
    artist: true,
    artistId: true,
  })

export const formUpdateSchema = formBaseSchema
  .extend({
    title: formBaseSchema.shape.title.unwrap(),
    subtitle: formBaseSchema.shape.subtitle.unwrap(),
    messagePrompt: formBaseSchema.shape.messagePrompt.unwrap(),
    artistId: formBaseSchema.shape.artistId.unwrap(),
  })
  .partial()
  
