import { z } from 'zod';

import {
	getIsoDateFromDate,
	getIsoDateRangeFromDescription,
} from '../../../utils/format-date';
import { queryStringEnumArrayToCommaString } from '../../../utils/zod-helpers';
import { tinybird } from '../../tinybird/client';
import { WEB_EVENT_TYPES } from '../event/event.tb';
import { WORKSPACE_TIMEZONES } from '../workspace/workspace.settings';

export const statDateRange = z.enum(['1d', '1w', '28d', '1y']);
export type StatDateRange = z.infer<typeof statDateRange>;

// export const TIMEZONE_TO_MV_MAP = {
// 	'America/New_York': 'web_sessions_et_mv',
// 	'America/Los_Angeles': 'web_sessions_pt_mv',
// 	// 'Europe/London': 'web_sessions_uk_mv',
// 	// Add other timezone -> materialized view mappings as needed
// } as const;

// standard pipe params
export const stdStatPipeParamsSchema = z.object({
	// handle: z.string().optional(),
	workspaceId: z.string().optional(),
	assetId: z.string().optional(),
	types: queryStringEnumArrayToCommaString([
		...WEB_EVENT_TYPES,
		'transparentLinkClick',
		'shortLinkClick',
	]).optional(),
	date_from: z.string(),
	date_to: z.string(),
	timezone: z.enum(WORKSPACE_TIMEZONES).optional(),

	// pagination
	skip: z.number().optional(),
	limit: z.number().optional(),
});

export const statGeoPipeParamsSchema = z.object({
	country: z.string().optional(),
	city: z.string().optional(),
});

export const statDevicePipeParamsSchema = z.object({
	device: z.string().optional(),
	os: z.string().optional(),
	browser: z.string().optional(),
});

export const statReferrersPipeParamsSchema = z.object({
	referer: z.string().optional(),
});

/**
 * web_events
 */

// pipe schema :: for use in calls to tinybird pipes
export const stdWebEventPipeParamsSchema = stdStatPipeParamsSchema
	.merge(statGeoPipeParamsSchema)
	.merge(statDevicePipeParamsSchema)
	.merge(statReferrersPipeParamsSchema);

// query schema :: for use on client
export const stdWebEventPipeQueryParamsSchema = stdWebEventPipeParamsSchema
	.omit({
		date_from: true,
		date_to: true,
	})
	.merge(
		z.object({
			dateRange: statDateRange.optional(),
			date_from: z.coerce.date().optional(),
			date_to: z.coerce.date().optional(),
		}),
	);

export type StdWebEventPipeQueryParams = z.infer<typeof stdWebEventPipeQueryParamsSchema>;

// pipe->query schema :: for use in calls from client to barely api (shaping for tinybird pipes)
export const stdWebEventQueryToPipeParamsSchema =
	stdWebEventPipeQueryParamsSchema.transform(data => {
		const date_range =
			data?.date_from && data.date_to ?
				{
					date_from: getIsoDateFromDate(data.date_from),
					date_to: getIsoDateFromDate(data.date_to),
				}
			:	getIsoDateRangeFromDescription(data?.dateRange ?? '1w');

		return {
			...data,
			...date_range,
			skip: data.skip ?? 0,
			limit: data.limit ?? 50,
		};
	});

/**
 * web_hits_timeseries
 */

export const webHitTimeseriesPipeDataSchema = z.object({
	date: z.coerce.date(),
	visits: z.number(),
	events: z.number(),
	bounce_rate: z.number().nullable(),
	avg_session_sec: z.number(),
});

export const pipe_webHitsTimeseries = tinybird.buildPipe({
	pipe: 'web_hits__timeseries',
	parameters: stdWebEventPipeParamsSchema,
	data: webHitTimeseriesPipeDataSchema,
});

/**
 * web_sources
 * */

// browser

export const topBrowsersPipeDataSchema = z.object({
	browser: z.string(),
	sessions: z.number(),
	hits: z.number(),
});

export const pipe_webSourcesTopBrowsers = tinybird.buildPipe({
	pipe: 'web_sources__top_browsers',
	parameters: stdWebEventPipeParamsSchema,
	data: topBrowsersPipeDataSchema,
	opts: {
		logParams: true,
	},
});

// device

export const topDevicesPipeDataSchema = z.object({
	device: z.string(),
	sessions: z.number(),
	hits: z.number(),
});

export const pipe_webSourcesTopDevices = tinybird.buildPipe({
	pipe: 'web_sources__top_devices',
	parameters: stdWebEventPipeParamsSchema,
	data: topDevicesPipeDataSchema,
});

// os

export const topOsPipeDataSchema = z.object({
	os: z.string(),
	sessions: z.number(),
	hits: z.number(),
});

export const pipe_webSourcesTopOs = tinybird.buildPipe({
	pipe: 'web_sources__top_os',
	parameters: stdWebEventPipeParamsSchema,
	data: topOsPipeDataSchema,
});

// city

export const topCitiesPipeDataSchema = z.object({
	city: z.string(),
	country: z.string(),
	sessions: z.number(),
	hits: z.number(),
});

export const pipe_webSourcesTopCities = tinybird.buildPipe({
	pipe: 'web_sources__top_cities',
	parameters: stdWebEventPipeParamsSchema,
	data: topCitiesPipeDataSchema,
});

// country

export const topCountriesPipeDataSchema = z.object({
	country: z.string(),
	sessions: z.number(),
	hits: z.number(),
});

export const pipe_webSourcesTopCountries = tinybird.buildPipe({
	pipe: 'web_sources__top_countries',
	parameters: stdWebEventPipeParamsSchema,
	data: topCountriesPipeDataSchema,
	opts: {
		logParams: true,
	},
});

// referers

export const topReferersPipeDataSchema = z.object({
	referer: z.string(),
	sessions: z.number(),
	hits: z.number(),
});

export const pipe_webSourcesTopReferers = tinybird.buildPipe({
	pipe: 'web_sources__top_referers',
	parameters: stdWebEventPipeParamsSchema,
	data: topReferersPipeDataSchema,
});
