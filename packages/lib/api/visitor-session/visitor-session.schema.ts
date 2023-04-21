import { z } from 'zod';

const visitorSessionSchema = z.object({
	id: z.string(),
	createdAt: z.date().optional(),
	externalWebsiteId: z.string().optional(),
	browserName: z.string().optional(),
	browserVersion: z.string().optional(),
	cpu: z.string().optional(),
	deviceName: z.string().optional(),
	deviceModel: z.string().optional(),
	deviceType: z.string().optional(),
	deviceVendor: z.string().optional(),
	ip: z.string().optional(),
	isBot: z.boolean().optional(),
	osName: z.string().optional(),
	osVersion: z.string().optional(),
	referrer: z.string().optional(),
	ua: z.string().optional(),
	city: z.string().optional(),
	country: z.string().optional(),
	latitude: z.string().optional(),
	longitude: z.string().optional(),
	region: z.string().optional(),
});

export { visitorSessionSchema };
