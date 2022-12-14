import { z } from 'zod';

export const userAgentSchema = z
	.object({
		isBot: z.boolean(),
		ua: z.string(),
		browser: z
			.object({
				name: z.string().optional(),
				version: z.string().optional(),
			})
			.optional(),
		device: z
			.object({
				model: z.string().optional(),
				type: z.string().optional(),
				vendor: z.string().optional(),
			})
			.optional(),
		engine: z
			.object({
				name: z.string().optional(),
				version: z.string().optional(),
			})
			.optional(),
		os: z
			.object({
				name: z.string().optional(),
				version: z.string().optional(),
			})
			.optional(),
		cpu: z
			.object({
				architecture: z.string().optional(),
			})
			.optional(),
	})
	.transform(userAgent => ({
		browserName: userAgent.browser?.name,
		browserVersion: userAgent.browser?.version,
		cpu: userAgent.cpu?.architecture,
		deviceModel: userAgent.device?.model,
		deviceType: userAgent.device?.type,
		deviceVendor: userAgent.device?.vendor,
		isBot: userAgent.isBot,
		osName: userAgent.os?.name,
		osVersion: userAgent.os?.version,
		ua: userAgent.ua,
	}));

export const geoSchema = z.object({
	city: z.string().optional(),
	country: z.string().optional(),
	latitude: z.string().optional(),
	longitude: z.string().optional(),
	region: z.string().optional(),
});
