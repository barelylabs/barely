import { FM_LINK_PLATFORMS, WEB_EVENT_TYPES, WORKSPACE_TIMEZONES } from '@barely/const';
import { getIsoDateFromDate, getIsoDateRangeFromDescription } from '@barely/utils';
import {
	queryBooleanSchema,
	queryStringEnumArrayToCommaString,
} from '@barely/validators/helpers';
import { z } from 'zod/v4';

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
	.extend(statGeoPipeParamsSchema.shape)
	.extend(statDevicePipeParamsSchema.shape)
	.extend(statReferrersPipeParamsSchema.shape);

// query schema :: for use on client
export const stdWebEventPipeQueryParamsSchema = stdWebEventPipeParamsSchema
	.omit({
		start: true,
		end: true,
	})
	.extend({
		dateRange: statDateRange.optional(),
		start: z.string().optional(),
		end: z.string().optional(),
		showVisits: queryBooleanSchema.optional().default(true),
		showClicks: queryBooleanSchema.optional().default(true),
		topEventType: z
			.enum([
				'bio/view',
				'bio/buttonClick',
				'bio/emailCapture',

				'cart/viewCheckout',
				'cart/checkoutPurchase',
				'cart/upsellPurchase',

				'fm/view',
				'fm/linkClick',

				'link/click',

				'page/view',
				'page/linkClick',

				'vip/view',
				'vip/emailCapture',
				'vip/download',
			])
			.optional(),
	});
export type StdWebEventPipeQueryParams = z.infer<typeof stdWebEventPipeQueryParamsSchema>;
export type TopEventType = z.infer<
	typeof stdWebEventPipeQueryParamsSchema
>['topEventType'];

export function getTopStatValue(
	eventType: TopEventType,
	d: {
		bio_views?: number;
		bio_buttonClicks?: number;
		bio_emailCaptures?: number;
		fm_linkClicks?: number;
		fm_views?: number;
		cart_checkoutViews?: number;
		cart_checkoutPurchases?: number;
		cart_upsellPurchases?: number;
		link_clicks?: number;
		page_views?: number;
		page_linkClicks?: number;
		vip_views?: number;
		vip_emailCaptures?: number;
		vip_downloads?: number;
	},
) {
	if (eventType === 'bio/view') return d.bio_views ?? 0;
	if (eventType === 'bio/buttonClick') return d.bio_buttonClicks ?? 0;
	if (eventType === 'bio/emailCapture') return d.bio_emailCaptures ?? 0;
	if (eventType === 'fm/linkClick') return d.fm_linkClicks ?? 0;
	if (eventType === 'fm/view') return d.fm_views ?? 0;
	if (eventType === 'cart/viewCheckout') return d.cart_checkoutViews ?? 0;
	if (eventType === 'cart/checkoutPurchase') return d.cart_checkoutPurchases ?? 0;
	if (eventType === 'cart/upsellPurchase') return d.cart_upsellPurchases ?? 0;
	if (eventType === 'link/click') return d.link_clicks ?? 0;
	if (eventType === 'page/view') return d.page_views ?? 0;
	if (eventType === 'page/linkClick') return d.page_linkClicks ?? 0;
	if (eventType === 'vip/view') return d.vip_views ?? 0;
	if (eventType === 'vip/emailCapture') return d.vip_emailCaptures ?? 0;
	if (eventType === 'vip/download') return d.vip_downloads ?? 0;
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

/**
 * top sources
 * */

export const sharedSourcePipeDataSchema = z.object({
	fm_views: z.number().optional().default(0),
	fm_linkClicks: z.number().optional().default(0),
	cart_checkoutViews: z.number().optional().default(0),
	cart_checkoutPurchases: z.number().optional().default(0),
	cart_upsellPurchases: z.number().optional().default(0),
	link_clicks: z.number().optional().default(0),
	page_views: z.number().optional().default(0),
	page_linkClicks: z.number().optional().default(0),
});

export const topBrowsersPipeDataSchema = sharedSourcePipeDataSchema.extend({
	browser: z.string(),
});

// device

export const topDevicesPipeDataSchema = sharedSourcePipeDataSchema.extend({
	device: z.string(),
});

// os

export const topOsPipeDataSchema = sharedSourcePipeDataSchema.extend({
	os: z.string(),
});

// journey funnel schemas

export const journeyFunnelParamsSchema = z.object({
	workspace_id: z.string(),
	start_date: z.string().optional(),
	end_date: z.string().optional(),
});

export const bioToCartFunnelSummarySchema = z.object({
	total_journeys: z.number(),
	journeys_with_bio_view: z.number(),
	journeys_with_bio_click: z.number(),
	total_bio_clicks: z.number(),
	journeys_reaching_cart: z.number(),
	journeys_reaching_checkout: z.number(),
	journeys_with_purchase: z.number(),
	total_purchases: z.number(),
	total_revenue_cents: z.number(),
	bio_engagement_rate: z.number().nullable(),
	bio_to_cart_rate: z.number().nullable(),
	cart_to_checkout_rate: z.number().nullable(),
	checkout_conversion_rate: z.number().nullable(),
	end_to_end_conversion_rate: z.number().nullable(),
	avg_journey_minutes: z.number().nullable(),
	avg_bio_clicks_per_journey: z.number().nullable(),
	avg_order_value_cents: z.number().nullable(),
});

export const funnelByOriginSchema = z.object({
	journeyOrigin: z.string(),
	journeys: z.number(),
	stage_1_bio_view: z.number(),
	stage_2_bio_click: z.number(),
	stage_3_cart_view: z.number(),
	stage_4_checkout_view: z.number(),
	stage_5_purchase: z.number(),
	dropoff_bio_view_to_click: z.number().nullable(),
	dropoff_bio_click_to_cart: z.number().nullable(),
	dropoff_cart_to_checkout: z.number().nullable(),
	dropoff_checkout_to_purchase: z.number().nullable(),
	total_revenue_cents: z.number(),
	avg_order_value_cents: z.number().nullable(),
});

export const hourlyPatternSchema = z.object({
	hour_of_day: z.number(),
	journeys: z.number(),
	conversions: z.number(),
	conversion_rate: z.number().nullable(),
	avg_duration_minutes: z.number().nullable(),
});

export const conversionByOriginSchema = z.object({
	journeyOrigin: z.string(),
	total_journeys: z.number(),
	journeys_with_bio_view: z.number(),
	journeys_with_bio_click: z.number(),
	journeys_with_cart_view: z.number(),
	journeys_with_purchase: z.number(),
	bio_click_rate: z.number().nullable(),
	bio_to_cart_rate: z.number().nullable(),
	cart_conversion_rate: z.number().nullable(),
	overall_conversion_rate: z.number().nullable(),
	avg_journey_duration: z.number().nullable(),
});

export const pathAnalysisSchema = z.object({
	path: z.string(),
	journey_count: z.number(),
	converted_journeys: z.number(),
	conversion_rate: z.number().nullable(),
	avg_duration: z.number().nullable(),
	avg_steps: z.number().nullable(),
});

export const dailyFunnelMetricsSchema = z.object({
	date: z.string(),
	bio_views: z.number(),
	bio_clicks: z.number(),
	cart_views: z.number(),
	purchases: z.number(),
	bio_ctr: z.number().nullable(),
	bio_to_cart_rate: z.number().nullable(),
	cart_conversion_rate: z.number().nullable(),
});

export const attributionAnalysisSchema = z.object({
	referrer_asset_id: z.string(),
	journeyOrigin: z.string(),
	attributed_journeys: z.number(),
	attributed_purchases: z.number(),
	conversion_rate: z.number().nullable(),
	avg_time_to_convert: z.number().nullable(),
});
