import { z } from 'zod';

import {
	getIsoDateFromDate,
	getIsoDateRangeFromDescription,
} from '../../../utils/format-date';
import {
	queryBooleanSchema,
	queryStringEnumArrayToCommaString,
} from '../../../utils/zod-helpers';
import { tinybird } from '../../tinybird/client';
import { WEB_EVENT_TYPES } from '../event/event.tb';
import { FM_LINK_PLATFORMS } from '../fm/fm.constants';
import { WORKSPACE_TIMEZONES } from '../workspace/workspace.settings';

export const statDateRange = z.enum(['1d', '1w', '28d', '1y']);
export type StatDateRange = z.infer<typeof statDateRange>;

// standard pipe params
export const stdStatPipeParamsSchema = z.object({
	workspaceId: z.string().optional(),
	assetId: z.string().optional(),
	types: queryStringEnumArrayToCommaString([...WEB_EVENT_TYPES]).optional(),
	platforms: queryStringEnumArrayToCommaString([...FM_LINK_PLATFORMS]).optional(),
	start: z.string(),
	end: z.string(),
	dateRange: statDateRange.optional(),
	granularity: z.enum(['month', 'day', 'hour']).optional(),
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
	sessionMetaCampaignId: z.string().optional(),
	sessionMetaAdSetId: z.string().optional(),
	sessionMetaAdId: z.string().optional(),
	sessionMetaPlacementId: z.string().optional(),
	sessionLandingPageId: z.string().optional(),
	sessionEmailBroadcastId: z.string().optional(),
	sessionEmailTemplateId: z.string().optional(),
	sessionFlowActionId: z.string().optional(),
});

/**
 * barely_events
 */

// pipe schema :: for use in calls to tinybird pipes
export const stdWebEventPipeParamsSchema = stdStatPipeParamsSchema
	.merge(statGeoPipeParamsSchema)
	.merge(statDevicePipeParamsSchema)
	.merge(statReferrersPipeParamsSchema);

// query schema :: for use on client
export const stdWebEventPipeQueryParamsSchema = stdWebEventPipeParamsSchema
	.omit({
		start: true,
		end: true,
	})
	.merge(
		z.object({
			dateRange: statDateRange.optional(),
			start: z.string().optional(),
			end: z.string().optional(),
			showVisits: queryBooleanSchema.optional().default(true),
			showClicks: queryBooleanSchema.optional().default(true),
		}),
	);

export type StdWebEventPipeQueryParams = z.infer<typeof stdWebEventPipeQueryParamsSchema>;

// pipe->query schema :: for use in calls from client to barely api (shaping for tinybird pipes)
export const stdWebEventQueryToPipeParamsSchema =
	stdWebEventPipeQueryParamsSchema.transform(data => {
		const date_range =
			data?.start && data.end ?
				{
					start: getIsoDateFromDate(new Date(data.start)),
					end: getIsoDateFromDate(new Date(data.end)),
				}
			:	getIsoDateRangeFromDescription(data?.dateRange ?? '1w');

		return {
			...data,
			...date_range,
			skip: data.skip ?? 0,
			limit: data.limit ?? 50,
		};
	});

export function getWebEventDateRange({
	start,
	end,
	dateRange,
}: {
	start?: Date;
	end?: Date;
	dateRange?: StatDateRange;
}) {
	if (start && end) {
		return {
			start: getIsoDateFromDate(start),
			end: getIsoDateFromDate(end),
		};
	}

	return getIsoDateRangeFromDescription(dateRange ?? '1w');
}

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

// fm

export const pipe_fmTimeseries = tinybird.buildPipe({
	pipe: 'v2_fm_timeseries',
	parameters: stdWebEventPipeParamsSchema,
	data: z.object({
		start: z.string(),
		fm_views: z.number(),
		fm_linkClicks: z.number(),
		fm_appleMusicClicks: z.number(),
		fm_amazonMusicClicks: z.number(),
		fm_spotifyClicks: z.number(),
		fm_youtubeClicks: z.number(),
		fm_youtubeMusicClicks: z.number(),
	}),
});

/**
 * top sources
 * */

const sharedSourcePipeDataSchema = z.object({
	fm_views: z.number().optional().default(0),
	fm_linkClicks: z.number().optional().default(0),
});

// browser

export const topBrowsersPipeDataSchema = sharedSourcePipeDataSchema.merge(
	z.object({ browser: z.string() }),
);

export const pipe_topBrowsers = tinybird.buildPipe({
	pipe: 'v2_browsers',
	parameters: stdWebEventPipeParamsSchema,
	data: topBrowsersPipeDataSchema,
	opts: {
		logParams: true,
	},
});

// device

export const topDevicesPipeDataSchema = sharedSourcePipeDataSchema.merge(
	z.object({ device: z.string() }),
);

export const pipe_topDevices = tinybird.buildPipe({
	pipe: 'v2_devices',
	parameters: stdWebEventPipeParamsSchema,
	data: topDevicesPipeDataSchema,
});

// os

export const topOsPipeDataSchema = sharedSourcePipeDataSchema.merge(
	z.object({ os: z.string() }),
);

export const pipe_topOs = tinybird.buildPipe({
	pipe: 'v2_os',
	parameters: stdWebEventPipeParamsSchema,
	data: topOsPipeDataSchema,
});

// city

export const topCitiesPipeDataSchema = sharedSourcePipeDataSchema.merge(
	z.object({
		city: z.string(),
		region: z.string().optional(),
		country: z.string(),
	}),
);

export const pipe_topCities = tinybird.buildPipe({
	pipe: 'v2_cities',
	parameters: stdWebEventPipeParamsSchema,
	data: topCitiesPipeDataSchema,
});

// region

export const topRegionsPipeDataSchema = sharedSourcePipeDataSchema.merge(
	z.object({
		region: z.string(),
		country: z.string(),
	}),
);

export const pipe_topRegions = tinybird.buildPipe({
	pipe: 'v2_regions',
	parameters: stdWebEventPipeParamsSchema,
	data: topRegionsPipeDataSchema,
});

// country

export const topCountriesPipeDataSchema = sharedSourcePipeDataSchema.merge(
	z.object({ country: z.string() }),
);

export const pipe_topCountries = tinybird.buildPipe({
	pipe: 'v2_countries',
	parameters: stdWebEventPipeParamsSchema,
	data: topCountriesPipeDataSchema,
});

// referers

export const topReferersPipeDataSchema = sharedSourcePipeDataSchema.merge(
	z.object({ referer: z.string() }),
);

export const pipe_topReferers = tinybird.buildPipe({
	pipe: 'v2_referers',
	parameters: stdWebEventPipeParamsSchema,
	data: topReferersPipeDataSchema,
});

// landing pages

export const topLandingPagesPipeDataSchema = sharedSourcePipeDataSchema.merge(
	z.object({ landingPageId: z.string() }),
);

export const pipe_topLandingPages = tinybird.buildPipe({
	pipe: 'v2_landingPages',
	parameters: stdWebEventPipeParamsSchema,
	data: topLandingPagesPipeDataSchema,
});

// email broadcasts

export const topEmailBroadcastsPipeDataSchema = sharedSourcePipeDataSchema.merge(
	z.object({ emailBroadcastId: z.string() }),
);

export const pipe_topEmailBroadcasts = tinybird.buildPipe({
	pipe: 'v2_emailBroadcasts',
	parameters: stdWebEventPipeParamsSchema,
	data: topEmailBroadcastsPipeDataSchema,
});

// email templates

export const topEmailTemplatesPipeDataSchema = sharedSourcePipeDataSchema.merge(
	z.object({ emailTemplateId: z.string() }),
);

export const pipe_topEmailTemplates = tinybird.buildPipe({
	pipe: 'v2_emailTemplates',
	parameters: stdWebEventPipeParamsSchema,
	data: topEmailTemplatesPipeDataSchema,
});

// flow actions

export const topFlowActionsPipeDataSchema = sharedSourcePipeDataSchema.merge(
	z.object({ flowActionId: z.string() }),
);

export const pipe_topFlowActions = tinybird.buildPipe({
	pipe: 'v2_flowActions',
	parameters: stdWebEventPipeParamsSchema,
	data: topFlowActionsPipeDataSchema,
});

// meta campaigns

export const topMetaCampaignsPipeDataSchema = sharedSourcePipeDataSchema.merge(
	z.object({ metaCampaignId: z.string() }),
);

export const pipe_topMetaCampaigns = tinybird.buildPipe({
	pipe: 'v2_metaCampaigns',
	parameters: stdWebEventPipeParamsSchema,
	data: topMetaCampaignsPipeDataSchema,
});

// meta ad sets

export const topMetaAdSetsPipeDataSchema = sharedSourcePipeDataSchema.merge(
	z.object({ metaAdSetId: z.string() }),
);

export const pipe_topMetaAdSets = tinybird.buildPipe({
	pipe: 'v2_metaAdSets',
	parameters: stdWebEventPipeParamsSchema,
	data: topMetaAdSetsPipeDataSchema,
});

// meta ad ids

export const topMetaAdsPipeDataSchema = sharedSourcePipeDataSchema.merge(
	z.object({ metaAdId: z.string() }),
);

export const pipe_topMetaAds = tinybird.buildPipe({
	pipe: 'v2_metaAds',
	parameters: stdWebEventPipeParamsSchema,
	data: topMetaAdsPipeDataSchema,
});

// meta placements

export const topMetaPlacementsPipeDataSchema = sharedSourcePipeDataSchema.merge(
	z.object({ metaPlacementId: z.string() }),
);

export const pipe_topMetaPlacements = tinybird.buildPipe({
	pipe: 'v2_metaPlacements',
	parameters: stdWebEventPipeParamsSchema,
	data: topMetaPlacementsPipeDataSchema,
});
