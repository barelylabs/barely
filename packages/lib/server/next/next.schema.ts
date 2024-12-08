import { z } from 'zod';

export const nextUserAgentToFormattedSchema = z
	.object({
		isBot: z.boolean().optional().default(false),
		ua: z.string().optional().default('Unknown'),
		browser: z
			.object({
				name: z.string().optional().default('Unknown'),
				version: z.string().optional().default('Unknown'),
			})
			.optional()
			.default({
				name: 'Unknown',
				version: 'Unknown',
			}),
		device: z
			.object({
				model: z.string().optional().default('Unknown'),
				type: z.string().optional().default('Desktop'),
				vendor: z.string().optional().default('Unknown'),
			})
			.optional()
			.default({
				model: 'Unknown',
				type: 'Unknown',
				vendor: 'Unknown',
			}),
		engine: z
			.object({
				name: z.string().optional().default('Unknown'),
				version: z.string().optional().default('Unknown'),
			})
			.optional()
			.default({
				name: 'Unknown',
				version: 'Unknown',
			}),
		os: z
			.object({
				name: z.string().optional().default('Unknown'),
				version: z.string().optional().default('Unknown'),
			})
			.optional()
			.default({
				name: 'Unknown',
				version: 'Unknown',
			}),
		cpu: z
			.object({
				architecture: z.string().optional().default('Unknown'),
			})
			.optional()
			.default({ architecture: 'Unknown' }),
	})
	.transform(userAgent => ({
		ua: userAgent.ua,
		browser: userAgent.browser?.name,
		browser_version: userAgent.browser?.version,
		engine: userAgent.engine?.name,
		engine_version: userAgent.engine?.version,
		os: userAgent.os?.name,
		os_version: userAgent.os?.version,
		device: userAgent.device?.type,
		device_vendor: userAgent.device?.vendor,
		device_model: userAgent.device?.model,
		cpu_architecture: userAgent.cpu?.architecture,
		bot: userAgent.isBot,
	}));

export const formattedUserAgentSchema = z.object({
	ua: z.string().optional().default('Unknown'),
	browser: z.string().optional().default('Unknown'),
	browser_version: z.string().optional().default('Unknown'),
	engine: z.string().optional().default('Unknown'),
	engine_version: z.string().optional().default('Unknown'),
	os: z.string().optional().default('Unknown'),
	os_version: z.string().optional().default('Unknown'),
	device: z.string().optional().default('Unknown'),
	device_vendor: z.string().optional().default('Unknown'),
	device_model: z.string().optional().default('Unknown'),
	cpu_architecture: z.string().optional().default('Unknown'),
	bot: z.boolean().optional().default(false),
});

export type NextFormattedUserAgent = z.infer<typeof formattedUserAgentSchema>;

export const nextGeoSchema = z.object({
	city: z.string().nullish().default('Unknown'),
	country: z.string().nullish().default('Unknown'),
	latitude: z.string().nullish().default('Unknown'),
	longitude: z.string().nullish().default('Unknown'),
	region: z.string().nullish().default('Unknown'),
	zip: z.string().nullish().default('Unknown'),
});

// export const formattedNextGeoSchema = z.object({
// 	city: z.string().nullable.default('Unknown'),
// 	country: z.string().default('Unknown'),
// 	latitude: z.string().default('Unknown'),
// 	longitude: z.string().default('Unknown'),
// 	region: z.string().default('Unknown'),
// });

export type NextGeo = z.infer<typeof nextGeoSchema>;
