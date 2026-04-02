import { z } from 'zod/v4';

import { tinybird } from '..';

const appDateRangeParamsSchema = z.object({
	start: z.string().optional(),
	end: z.string().optional(),
});

export const pipe_appDailyActiveUsers = tinybird.buildPipe({
	pipe: 'app_daily_active_users',
	parameters: appDateRangeParamsSchema,
	data: z.object({
		date: z.string(),
		activeUsers: z.number(),
	}),
});

export const pipe_appFeatureUsage = tinybird.buildPipe({
	pipe: 'app_feature_usage',
	parameters: appDateRangeParamsSchema,
	data: z.object({
		type: z.string(),
		eventCount: z.number(),
		uniqueUsers: z.number(),
	}),
});

export const pipe_appPageViews = tinybird.buildPipe({
	pipe: 'app_page_views',
	parameters: appDateRangeParamsSchema,
	data: z.object({
		pagePath: z.string(),
		views: z.number(),
		uniqueUsers: z.number(),
	}),
});
