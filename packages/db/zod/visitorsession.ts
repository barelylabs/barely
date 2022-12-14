import * as z from "zod"
import { EventRelations, eventRelationsSchema, eventBaseSchema } from "./event"
import { ExternalWebsiteRelations, externalWebsiteRelationsSchema, externalWebsiteBaseSchema } from "./externalwebsite"

export const visitorSessionBaseSchema = z.object({
  id: z.string(),
  createdAt: z.date(),
  externalWebsiteId: z.string().nullable(),
  browserName: z.string().nullable(),
  browserVersion: z.string().nullable(),
  cpu: z.string().nullable(),
  deviceModel: z.string().nullable(),
  deviceType: z.string().nullable(),
  deviceVendor: z.string().nullable(),
  ip: z.string().nullable(),
  isBot: z.boolean().nullable(),
  osName: z.string().nullable(),
  osVersion: z.string().nullable(),
  ua: z.string().nullable(),
  city: z.string().nullable(),
  country: z.string().nullable(),
  latitude: z.string().nullable(),
  longitude: z.string().nullable(),
  region: z.string().nullable(),
})

export interface VisitorSessionRelations {
  events: (z.infer<typeof eventBaseSchema> & EventRelations)[]
  externalWebsite: (z.infer<typeof externalWebsiteBaseSchema> & ExternalWebsiteRelations) | null
}

export const visitorSessionRelationsSchema: z.ZodObject<{
  [K in keyof VisitorSessionRelations]: z.ZodType<VisitorSessionRelations[K]>
}> = z.object({
  events: z.lazy(() => eventBaseSchema.merge(eventRelationsSchema)).array(),
  externalWebsite: z.lazy(() => externalWebsiteBaseSchema.merge(externalWebsiteRelationsSchema)).nullable(),
})

export const visitorSessionSchema = visitorSessionBaseSchema
  .merge(visitorSessionRelationsSchema)

export const visitorSessionCreateSchema = visitorSessionBaseSchema
  .extend({
    externalWebsiteId: visitorSessionBaseSchema.shape.externalWebsiteId.unwrap(),
    browserName: visitorSessionBaseSchema.shape.browserName.unwrap(),
    browserVersion: visitorSessionBaseSchema.shape.browserVersion.unwrap(),
    cpu: visitorSessionBaseSchema.shape.cpu.unwrap(),
    deviceModel: visitorSessionBaseSchema.shape.deviceModel.unwrap(),
    deviceType: visitorSessionBaseSchema.shape.deviceType.unwrap(),
    deviceVendor: visitorSessionBaseSchema.shape.deviceVendor.unwrap(),
    ip: visitorSessionBaseSchema.shape.ip.unwrap(),
    isBot: visitorSessionBaseSchema.shape.isBot.unwrap(),
    osName: visitorSessionBaseSchema.shape.osName.unwrap(),
    osVersion: visitorSessionBaseSchema.shape.osVersion.unwrap(),
    ua: visitorSessionBaseSchema.shape.ua.unwrap(),
    city: visitorSessionBaseSchema.shape.city.unwrap(),
    country: visitorSessionBaseSchema.shape.country.unwrap(),
    latitude: visitorSessionBaseSchema.shape.latitude.unwrap(),
    longitude: visitorSessionBaseSchema.shape.longitude.unwrap(),
    region: visitorSessionBaseSchema.shape.region.unwrap(),
  }).partial({
    id: true,
    createdAt: true,
    events: true,
    externalWebsite: true,
    externalWebsiteId: true,
    browserName: true,
    browserVersion: true,
    cpu: true,
    deviceModel: true,
    deviceType: true,
    deviceVendor: true,
    ip: true,
    isBot: true,
    osName: true,
    osVersion: true,
    ua: true,
    city: true,
    country: true,
    latitude: true,
    longitude: true,
    region: true,
  })

export const visitorSessionUpdateSchema = visitorSessionBaseSchema
  .extend({
    externalWebsiteId: visitorSessionBaseSchema.shape.externalWebsiteId.unwrap(),
    browserName: visitorSessionBaseSchema.shape.browserName.unwrap(),
    browserVersion: visitorSessionBaseSchema.shape.browserVersion.unwrap(),
    cpu: visitorSessionBaseSchema.shape.cpu.unwrap(),
    deviceModel: visitorSessionBaseSchema.shape.deviceModel.unwrap(),
    deviceType: visitorSessionBaseSchema.shape.deviceType.unwrap(),
    deviceVendor: visitorSessionBaseSchema.shape.deviceVendor.unwrap(),
    ip: visitorSessionBaseSchema.shape.ip.unwrap(),
    isBot: visitorSessionBaseSchema.shape.isBot.unwrap(),
    osName: visitorSessionBaseSchema.shape.osName.unwrap(),
    osVersion: visitorSessionBaseSchema.shape.osVersion.unwrap(),
    ua: visitorSessionBaseSchema.shape.ua.unwrap(),
    city: visitorSessionBaseSchema.shape.city.unwrap(),
    country: visitorSessionBaseSchema.shape.country.unwrap(),
    latitude: visitorSessionBaseSchema.shape.latitude.unwrap(),
    longitude: visitorSessionBaseSchema.shape.longitude.unwrap(),
    region: visitorSessionBaseSchema.shape.region.unwrap(),
  })
  .partial()
  
