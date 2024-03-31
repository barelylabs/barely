import { z } from 'zod';

import { formattedUserAgentSchema, nextGeoSchema } from '../../next/next.schema';
import { tinybird } from '../../tinybird/client';

// schema
export const visitorSessionTinybirdSchema = z
	.object({
		referer: z
			.string()
			.nullish()
			.transform(s => s ?? '(direct)'),
		referer_url: z
			.string()
			.nullish()
			.transform(s => s ?? '(direct)'),
	})
	.merge(nextGeoSchema)
	.merge(formattedUserAgentSchema);

export const reportedEventTinybirdSchema = z.object({
	reportedToMeta: z.string().optional().default(''),
	reportedToTiktok: z.string().optional().default(''),
});

// publish web events

export const webEventIngestSchema = z
	.object({
		workspaceId: z.string(),
		sessionId: z.string(),

		// where the event happened
		href: z.string(),
		assetId: z.string(),

		// short link data
		domain: z.string().optional().default(''),
		key: z.string().optional().default(''),

		// click data
		timestamp: z.string().datetime(),
		type: z.enum([
			'shortLinkClick',
			'transparentLinkClick',
			'bioLinkClick',
			'bioPageView',
		]),
	})
	.merge(visitorSessionTinybirdSchema)
	.merge(reportedEventTinybirdSchema);

export const ingestWebEvent = tinybird.buildIngestEndpoint({
	datasource: 'web_events',
	event: webEventIngestSchema,
});
