import { z } from 'zod/v4';

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
			topEventType: z
				.enum([
					'cart/viewCheckout',
					'cart/checkoutPurchase',
					'cart/upsellPurchase',

					'fm/view',
					'fm/linkClick',

					'link/click',

					'page/view',
					'page/linkClick',
				])
				.optional(),
		}),
	);
export type StdWebEventPipeQueryParams = z.infer<typeof stdWebEventPipeQueryParamsSchema>;
export type TopEventType = z.infer<
	typeof stdWebEventPipeQueryParamsSchema
>['topEventType'];

export function getTopStatValue(
	eventType: TopEventType,
	d: {
		fm_linkClicks?: number;
		fm_views?: number;
		cart_checkoutViews?: number;
		cart_checkoutPurchases?: number;
		cart_upsellPurchases?: number;
		link_clicks?: number;
		page_views?: number;
		page_linkClicks?: number;
	},
) {
	if (eventType === 'fm/linkClick') return d.fm_linkClicks ?? 0;
	if (eventType === 'fm/view') return d.fm_views ?? 0;
	if (eventType === 'cart/viewCheckout') return d.cart_checkoutViews ?? 0;
	if (eventType === 'cart/checkoutPurchase') return d.cart_checkoutPurchases ?? 0;
	if (eventType === 'cart/upsellPurchase') return d.cart_upsellPurchases ?? 0;
	if (eventType === 'link/click') return d.link_clicks ?? 0;
	if (eventType === 'page/view') return d.page_views ?? 0;
	if (eventType === 'page/linkClick') return d.page_linkClicks ?? 0;
	return 0;
}

// pipe->query schema :: for use in calls from client to barely api (shaping for tinybird pipes)
export const stdWebEventQueryToPipeParamsSchema =
	stdWebEventPipeQueryParamsSchema.transform(data => {
		const date_range =
			data.start && data.end ?
				{
					start: getIsoDateFromDate(new Date(data.start)),
					end: getIsoDateFromDate(new Date(data.end)),
				}
			:	getIsoDateRangeFromDescription(data.dateRange ?? '1w');

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

// const sharedSourcePipeDataSchema = z.object({
// 	fm_views: z.number().optional().default(0),
// 	fm_linkClicks: z.number().optional().default(0),
// 	cart_views: z.number().optional().default(0),
// 	cart_checkoutPurchases: z.number().optional().default(0),
// });

const sharedSourcePipeDataSchema = z.object({
	fm_views: z.number().optional().default(0),
	fm_linkClicks: z.number().optional().default(0),
	cart_checkoutViews: z.number().optional().default(0),
	cart_checkoutPurchases: z.number().optional().default(0),
	cart_upsellPurchases: z.number().optional().default(0),
	link_clicks: z.number().optional().default(0),
	page_views: z.number().optional().default(0),
	page_linkClicks: z.number().optional().default(0),
});
// browser

// export const topBrowsersPipeDataSchema = sharedSourcePipeDataSchema.merge(
// 	z.object({ browser: z.string() }),
// );

const topBrowsersPipeDataSchema = sharedSourcePipeDataSchema.extend({
	browser: z.string(),
});

export const pipe_fmTopBrowsers = tinybird.buildPipe({
	pipe: 'v2_fm_browsers',
	parameters: stdWebEventPipeParamsSchema,
	data: topBrowsersPipeDataSchema,
});

export const pipe_linkTopBrowsers = tinybird.buildPipe({
	pipe: 'v2_link_browsers',
	parameters: stdWebEventPipeParamsSchema,
	data: topBrowsersPipeDataSchema,
});

export const pipe_cartTopBrowsers = tinybird.buildPipe({
	pipe: 'v2_cart_browsers',
	parameters: stdWebEventPipeParamsSchema,
	data: topBrowsersPipeDataSchema,
});

export const pipe_pageTopBrowsers = tinybird.buildPipe({
	pipe: 'v2_page_browsers',
	parameters: stdWebEventPipeParamsSchema,
	data: topBrowsersPipeDataSchema,
});

// device

// export const topDevicesPipeDataSchema = sharedSourcePipeDataSchema.merge(
// 	z.object({ device: z.string() }),
// );

const topDevicesPipeDataSchema = sharedSourcePipeDataSchema.extend({
	device: z.string(),
});

export const pipe_fmTopDevices = tinybird.buildPipe({
	pipe: 'v2_fm_devices',
	parameters: stdWebEventPipeParamsSchema,
	data: topDevicesPipeDataSchema,
});

export const pipe_linkTopDevices = tinybird.buildPipe({
	pipe: 'v2_link_devices',
	parameters: stdWebEventPipeParamsSchema,
	data: topDevicesPipeDataSchema,
});

export const pipe_cartTopDevices = tinybird.buildPipe({
	pipe: 'v2_cart_devices',
	parameters: stdWebEventPipeParamsSchema,
	data: topDevicesPipeDataSchema,
});

export const pipe_pageTopDevices = tinybird.buildPipe({
	pipe: 'v2_page_devices',
	parameters: stdWebEventPipeParamsSchema,
	data: topDevicesPipeDataSchema,
});

// os

const topOsPipeDataSchema = sharedSourcePipeDataSchema.extend({
	os: z.string(),
});

export const pipe_fmTopOs = tinybird.buildPipe({
	pipe: 'v2_fm_os',
	parameters: stdWebEventPipeParamsSchema,
	data: topOsPipeDataSchema,
});

export const pipe_linkTopOs = tinybird.buildPipe({
	pipe: 'v2_link_os',
	parameters: stdWebEventPipeParamsSchema,
	data: topOsPipeDataSchema,
});

export const pipe_cartTopOs = tinybird.buildPipe({
	pipe: 'v2_cart_os',
	parameters: stdWebEventPipeParamsSchema,
	data: topOsPipeDataSchema,
});

export const pipe_pageTopOs = tinybird.buildPipe({
	pipe: 'v2_page_os',
	parameters: stdWebEventPipeParamsSchema,
	data: topOsPipeDataSchema,
});

// city

export const pipe_fmTopCities = tinybird.buildPipe({
	pipe: 'v2_fm_cities',
	parameters: stdWebEventPipeParamsSchema,
	data: z.object({
		fm_views: z.number(),
		fm_linkClicks: z.number(),
		city: z.string(),
		region: z.string(),
		country: z.string(),
	}),
});

export const pipe_linkTopCities = tinybird.buildPipe({
	pipe: 'v2_link_cities',
	parameters: stdWebEventPipeParamsSchema,
	data: z.object({
		link_clicks: z.number(),
		city: z.string(),
		region: z.string(),
		country: z.string(),
	}),
});

export const pipe_cartTopCities = tinybird.buildPipe({
	pipe: 'v2_cart_cities',
	parameters: stdWebEventPipeParamsSchema,
	data: z.object({
		cart_checkoutViews: z.number(),
		cart_checkoutPurchases: z.number(),
		cart_upsellPurchases: z.number(),
		city: z.string(),
		region: z.string(),
		country: z.string(),
	}),
});

export const pipe_pageTopCities = tinybird.buildPipe({
	pipe: 'v2_page_cities',
	parameters: stdWebEventPipeParamsSchema,
	data: z.object({
		page_views: z.number(),
		city: z.string(),
		region: z.string(),
		country: z.string(),
	}),
});

// region

export const pipe_fmTopRegions = tinybird.buildPipe({
	pipe: 'v2_fm_regions',
	parameters: stdWebEventPipeParamsSchema,
	data: z.object({
		fm_views: z.number(),
		fm_linkClicks: z.number(),
		region: z.string(),
		country: z.string(),
	}),
});

export const pipe_linkTopRegions = tinybird.buildPipe({
	pipe: 'v2_link_regions',
	parameters: stdWebEventPipeParamsSchema,
	data: z.object({
		link_clicks: z.number(),
		region: z.string(),
		country: z.string(),
	}),
});

export const pipe_cartTopRegions = tinybird.buildPipe({
	pipe: 'v2_cart_regions',
	parameters: stdWebEventPipeParamsSchema,
	data: z.object({
		cart_checkoutViews: z.number(),
		cart_checkoutPurchases: z.number(),
		cart_upsellPurchases: z.number(),
		region: z.string(),
		country: z.string(),
	}),
});

export const pipe_pageTopRegions = tinybird.buildPipe({
	pipe: 'v2_page_regions',
	parameters: stdWebEventPipeParamsSchema,
	data: z.object({
		page_views: z.number(),
		region: z.string(),
		country: z.string(),
	}),
});

// country

export const pipe_fmTopCountries = tinybird.buildPipe({
	pipe: 'v2_fm_countries',
	parameters: stdWebEventPipeParamsSchema,
	data: z.object({
		fm_views: z.number(),
		fm_linkClicks: z.number(),
		country: z.string(),
	}),
});

export const pipe_linkTopCountries = tinybird.buildPipe({
	pipe: 'v2_link_countries',
	parameters: stdWebEventPipeParamsSchema,
	data: z.object({
		link_clicks: z.number(),
		country: z.string(),
	}),
});

export const pipe_cartTopCountries = tinybird.buildPipe({
	pipe: 'v2_cart_countries',
	parameters: stdWebEventPipeParamsSchema,
	data: z.object({
		cart_checkoutViews: z.number(),
		cart_checkoutPurchases: z.number(),
		cart_upsellPurchases: z.number(),
		country: z.string(),
	}),
});

export const pipe_pageTopCountries = tinybird.buildPipe({
	pipe: 'v2_page_countries',
	parameters: stdWebEventPipeParamsSchema,
	data: z.object({
		page_views: z.number(),
		country: z.string(),
	}),
});
// referers

// export const topReferersPipeDataSchema = sharedSourcePipeDataSchema.merge(
// 	z.object({ referer: z.string() }),
// );

export const pipe_fmTopReferers = tinybird.buildPipe({
	pipe: 'v2_fm_referers',
	parameters: stdWebEventPipeParamsSchema,
	data: z.object({
		fm_views: z.number(),
		fm_linkClicks: z.number(),
		referer: z.string(),
	}),
});

export const pipe_linkTopReferers = tinybird.buildPipe({
	pipe: 'v2_link_referers',
	parameters: stdWebEventPipeParamsSchema,
	data: z.object({
		link_clicks: z.number(),
		referer: z.string(),
	}),
});

export const pipe_cartTopReferers = tinybird.buildPipe({
	pipe: 'v2_cart_referers',
	parameters: stdWebEventPipeParamsSchema,
	data: z.object({
		cart_checkoutViews: z.number(),
		cart_checkoutPurchases: z.number(),
		cart_upsellPurchases: z.number(),
		referer: z.string(),
	}),
});

export const pipe_pageTopReferers = tinybird.buildPipe({
	pipe: 'v2_page_referers',
	parameters: stdWebEventPipeParamsSchema,
	data: z.object({
		page_views: z.number(),
		referer: z.string(),
	}),
});

// carts
export const pipe_cartTimeseries = tinybird.buildPipe({
	pipe: 'v2_cart_timeseries',
	parameters: stdWebEventPipeParamsSchema,
	data: z.object({
		start: z.string(),
		cart_checkoutViews: z.number(),
		cart_emailAdds: z.number(),
		cart_shippingInfoAdds: z.number(),
		cart_paymentInfoAdds: z.number(),
		cart_mainWithoutBumpPurchases: z.number(),
		cart_mainWithBumpPurchases: z.number(),
		cart_upsellPurchases: z.number(),
		cart_upsellDeclines: z.number(),
		cart_checkoutPurchases: z.number(),

		cart_checkoutPurchaseProductAmount: z.number(),
		cart_checkoutPurchaseGrossAmount: z.number(),

		cart_upsellPurchaseProductAmount: z.number(),
		cart_upsellPurchaseGrossAmount: z.number(),

		cart_purchaseProductAmount: z.number(),
		cart_purchaseGrossAmount: z.number(),
	}),
});

// landing pages
export const pipe_pageTimeseries = tinybird.buildPipe({
	pipe: 'v2_page_timeseries',
	parameters: stdWebEventPipeParamsSchema,
	data: z.object({
		start: z.string(),
		page_views: z.number(),
		page_linkClicks: z.number(),
	}),
});

// export const topLandingPagesPipeDataSchema = sharedSourcePipeDataSchema.merge(
// 	z.object({ sessionLandingPageId: z.string() }),
// );

export const pipe_fmTopLandingPages = tinybird.buildPipe({
	pipe: 'v2_fm_landingPages',
	parameters: stdWebEventPipeParamsSchema,
	data: z.object({
		fm_views: z.number(),
		fm_linkClicks: z.number(),
		sessionLandingPageId: z.string(),
	}),
});

export const pipe_linkTopLandingPages = tinybird.buildPipe({
	pipe: 'v2_link_landingPages',
	parameters: stdWebEventPipeParamsSchema,
	data: z.object({
		link_clicks: z.number(),
		sessionLandingPageId: z.string(),
	}),
});

export const pipe_cartTopLandingPages = tinybird.buildPipe({
	pipe: 'v2_cart_landingPages',
	parameters: stdWebEventPipeParamsSchema,
	data: z.object({
		cart_checkoutViews: z.number(),
		cart_checkoutPurchases: z.number(),
		sessionLandingPageId: z.string(),
	}),
});

export const pipe_pageTopLandingPages = tinybird.buildPipe({
	pipe: 'v2_page_landingPages',
	parameters: stdWebEventPipeParamsSchema,
	data: z.object({
		page_views: z.number(),
		sessionLandingPageId: z.string(),
	}),
});

// links
export const pipe_linkTimeseries = tinybird.buildPipe({
	pipe: 'v2_link_timeseries',
	parameters: stdWebEventPipeParamsSchema,
	data: z.object({
		start: z.string(),
		link_clicks: z.number(),
	}),
});

// email broadcasts

// export const topEmailBroadcastsPipeDataSchema = sharedSourcePipeDataSchema.merge(
// 	z.object({ sessionEmailBroadcastId: z.string() }),
// );

export const pipe_fmTopEmailBroadcasts = tinybird.buildPipe({
	pipe: 'v2_fm_emailBroadcasts',
	parameters: stdWebEventPipeParamsSchema,
	data: z.object({
		fm_views: z.number(),
		fm_linkClicks: z.number(),
		sessionEmailBroadcastId: z.string(),
	}),
});

export const pipe_linkTopEmailBroadcasts = tinybird.buildPipe({
	pipe: 'v2_link_emailBroadcasts',
	parameters: stdWebEventPipeParamsSchema,
	data: z.object({
		link_clicks: z.number(),
		sessionEmailBroadcastId: z.string(),
	}),
});

export const pipe_cartTopEmailBroadcasts = tinybird.buildPipe({
	pipe: 'v2_cart_emailBroadcasts',
	parameters: stdWebEventPipeParamsSchema,
	data: z.object({
		cart_checkoutViews: z.number(),
		cart_checkoutPurchases: z.number(),
		sessionEmailBroadcastId: z.string(),
	}),
});

export const pipe_pageTopEmailBroadcasts = tinybird.buildPipe({
	pipe: 'v2_page_emailBroadcasts',
	parameters: stdWebEventPipeParamsSchema,
	data: z.object({
		page_views: z.number(),
		sessionEmailBroadcastId: z.string(),
	}),
});

// email templates

// export const topEmailTemplatesPipeDataSchema = sharedSourcePipeDataSchema.merge(
// 	z.object({ sessionEmailTemplateId: z.string() }),
// );

export const pipe_fmTopEmailTemplates = tinybird.buildPipe({
	pipe: 'v2_fm_emailTemplates',
	parameters: stdWebEventPipeParamsSchema,
	data: z.object({
		fm_views: z.number(),
		fm_linkClicks: z.number(),
		sessionEmailTemplateId: z.string(),
	}),
});

export const pipe_linkTopEmailTemplates = tinybird.buildPipe({
	pipe: 'v2_link_emailTemplates',
	parameters: stdWebEventPipeParamsSchema,
	data: z.object({
		link_clicks: z.number(),
		sessionEmailTemplateId: z.string(),
	}),
});

export const pipe_cartTopEmailTemplates = tinybird.buildPipe({
	pipe: 'v2_cart_emailTemplates',
	parameters: stdWebEventPipeParamsSchema,
	data: z.object({
		cart_checkoutViews: z.number(),
		cart_checkoutPurchases: z.number(),
		sessionEmailTemplateId: z.string(),
	}),
});

export const pipe_pageTopEmailTemplates = tinybird.buildPipe({
	pipe: 'v2_page_emailTemplates',
	parameters: stdWebEventPipeParamsSchema,
	data: z.object({
		page_views: z.number(),
		sessionEmailTemplateId: z.string(),
	}),
});

// flow actions

// export const topFlowActionsPipeDataSchema = sharedSourcePipeDataSchema.merge(
// 	z.object({ sessionFlowActionId: z.string() }),
// );

export const pipe_fmTopFlowActions = tinybird.buildPipe({
	pipe: 'v2_fm_flowActions',
	parameters: stdWebEventPipeParamsSchema,
	data: z.object({
		fm_views: z.number(),
		fm_linkClicks: z.number(),
		sessionFlowActionId: z.string(),
	}),
});

export const pipe_linkTopFlowActions = tinybird.buildPipe({
	pipe: 'v2_link_flowActions',
	parameters: stdWebEventPipeParamsSchema,
	data: z.object({
		link_clicks: z.number(),
		sessionFlowActionId: z.string(),
	}),
});

export const pipe_cartTopFlowActions = tinybird.buildPipe({
	pipe: 'v2_cart_flowActions',
	parameters: stdWebEventPipeParamsSchema,
	data: z.object({
		cart_checkoutViews: z.number(),
		cart_checkoutPurchases: z.number(),
		sessionFlowActionId: z.string(),
	}),
});

export const pipe_pageTopFlowActions = tinybird.buildPipe({
	pipe: 'v2_page_flowActions',
	parameters: stdWebEventPipeParamsSchema,
	data: z.object({
		page_views: z.number(),
		sessionFlowActionId: z.string(),
	}),
});

// meta campaigns

// export const topMetaCampaignsPipeDataSchema = sharedSourcePipeDataSchema.merge(
// 	z.object({ sessionMetaCampaignId: z.string() }),
// );

export const pipe_fmTopMetaCampaigns = tinybird.buildPipe({
	pipe: 'v2_fm_metaCampaigns',
	parameters: stdWebEventPipeParamsSchema,
	data: z.object({
		fm_views: z.number(),
		fm_linkClicks: z.number(),
		sessionMetaCampaignId: z.string(),
	}),
});

export const pipe_linkTopMetaCampaigns = tinybird.buildPipe({
	pipe: 'v2_link_metaCampaigns',
	parameters: stdWebEventPipeParamsSchema,
	data: z.object({
		link_clicks: z.number(),
		sessionMetaCampaignId: z.string(),
	}),
});

export const pipe_cartTopMetaCampaigns = tinybird.buildPipe({
	pipe: 'v2_cart_metaCampaigns',
	parameters: stdWebEventPipeParamsSchema,
	data: z.object({
		cart_checkoutViews: z.number(),
		cart_checkoutPurchases: z.number(),
		cart_upsellPurchases: z.number(),
		sessionMetaCampaignId: z.string(),
	}),
});

export const pipe_pageTopMetaCampaigns = tinybird.buildPipe({
	pipe: 'v2_page_metaCampaigns',
	parameters: stdWebEventPipeParamsSchema,
	data: z.object({
		page_views: z.number(),
		sessionMetaCampaignId: z.string(),
	}),
});

// meta ad sets

// export const topMetaAdSetsPipeDataSchema = sharedSourcePipeDataSchema.merge(
// 	z.object({ sessionMetaAdSetId: z.string() }),
// );

export const pipe_fmTopMetaAdSets = tinybird.buildPipe({
	pipe: 'v2_fm_metaAdSets',
	parameters: stdWebEventPipeParamsSchema,
	data: z.object({
		fm_views: z.number(),
		fm_linkClicks: z.number(),
		sessionMetaAdSetId: z.string(),
	}),
});

export const pipe_linkTopMetaAdSets = tinybird.buildPipe({
	pipe: 'v2_link_metaAdSets',
	parameters: stdWebEventPipeParamsSchema,
	data: z.object({
		link_clicks: z.number(),
		sessionMetaAdSetId: z.string(),
	}),
});

export const pipe_cartTopMetaAdSets = tinybird.buildPipe({
	pipe: 'v2_cart_metaAdSets',
	parameters: stdWebEventPipeParamsSchema,
	data: z.object({
		cart_checkoutViews: z.number(),
		cart_checkoutPurchases: z.number(),
		cart_upsellPurchases: z.number(),
		sessionMetaAdSetId: z.string(),
	}),
});

export const pipe_pageTopMetaAdSets = tinybird.buildPipe({
	pipe: 'v2_page_metaAdSets',
	parameters: stdWebEventPipeParamsSchema,
	data: z.object({
		page_views: z.number(),
		sessionMetaAdSetId: z.string(),
	}),
});

// meta ad ids

// export const topMetaAdsPipeDataSchema = sharedSourcePipeDataSchema.merge(
// 	z.object({ sessionMetaAdId: z.string() }),
// );

export const pipe_fmTopMetaAds = tinybird.buildPipe({
	pipe: 'v2_fm_metaAds',
	parameters: stdWebEventPipeParamsSchema,
	data: z.object({
		fm_views: z.number(),
		fm_linkClicks: z.number(),
		sessionMetaAdId: z.string(),
	}),
});

export const pipe_linkTopMetaAds = tinybird.buildPipe({
	pipe: 'v2_link_metaAds',
	parameters: stdWebEventPipeParamsSchema,
	data: z.object({
		link_clicks: z.number(),
		sessionMetaAdId: z.string(),
	}),
});

export const pipe_cartTopMetaAds = tinybird.buildPipe({
	pipe: 'v2_cart_metaAds',
	parameters: stdWebEventPipeParamsSchema,
	data: z.object({
		cart_checkoutViews: z.number(),
		cart_checkoutPurchases: z.number(),
		cart_upsellPurchases: z.number(),
		sessionMetaAdId: z.string(),
	}),
});

export const pipe_pageTopMetaAds = tinybird.buildPipe({
	pipe: 'v2_page_metaAds',
	parameters: stdWebEventPipeParamsSchema,
	data: z.object({
		page_views: z.number(),
		sessionMetaAdId: z.string(),
	}),
});

// meta placements

// export const topMetaPlacementsPipeDataSchema = sharedSourcePipeDataSchema.merge(
// 	z.object({ sessionMetaPlacement: z.string() }),
// );

export const pipe_fmTopMetaPlacements = tinybird.buildPipe({
	pipe: 'v2_fm_metaPlacements',
	parameters: stdWebEventPipeParamsSchema,
	data: z.object({
		fm_views: z.number(),
		fm_linkClicks: z.number(),
		sessionMetaPlacement: z.string(),
	}),
});

export const pipe_linkTopMetaPlacements = tinybird.buildPipe({
	pipe: 'v2_link_metaPlacements',
	parameters: stdWebEventPipeParamsSchema,
	data: z.object({
		link_clicks: z.number(),
		sessionMetaPlacement: z.string(),
	}),
});

export const pipe_cartTopMetaPlacements = tinybird.buildPipe({
	pipe: 'v2_cart_metaPlacements',
	parameters: stdWebEventPipeParamsSchema,
	data: z.object({
		cart_checkoutViews: z.number(),
		cart_checkoutPurchases: z.number(),
		cart_upsellPurchases: z.number(),
		sessionMetaPlacement: z.string(),
	}),
});

export const pipe_pageTopMetaPlacements = tinybird.buildPipe({
	pipe: 'v2_page_metaPlacements',
	parameters: stdWebEventPipeParamsSchema,
	data: z.object({
		page_views: z.number(),
		sessionMetaPlacement: z.string(),
	}),
});
