import { z } from 'zod/v4';

import { tinybird } from '..';
import {
	stdWebEventPipeParamsSchema,
	topBrowsersPipeDataSchema,
	topDevicesPipeDataSchema,
	topOsPipeDataSchema,
	webHitTimeseriesPipeDataSchema,
} from '../schema';

export const pipe_webHitsTimeseries = tinybird.buildPipe({
	pipe: 'web_hits__timeseries',
	parameters: stdWebEventPipeParamsSchema,
	data: webHitTimeseriesPipeDataSchema,
});

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

export const pipe_vipTimeseries = tinybird.buildPipe({
	pipe: 'vip_timeseries',
	parameters: stdWebEventPipeParamsSchema,
	data: z.object({
		start: z.string(),
		vip_views: z.number(),
		vip_emailCaptures: z.number(),
		vip_downloads: z.number(),
		vip_contactViews: z.number(),
		vip_presaveViews: z.number(),
		vip_presaveForeverViews: z.number(),
	}),
});

export const pipe_vipTopBrowsers = tinybird.buildPipe({
	pipe: 'vip_browsers',
	parameters: stdWebEventPipeParamsSchema,
	data: z.object({
		browser: z.string(),
		vip_views: z.number(),
		vip_emailCaptures: z.number(),
		vip_downloads: z.number(),
	}),
});

export const pipe_vipTopDevices = tinybird.buildPipe({
	pipe: 'vip_devices',
	parameters: stdWebEventPipeParamsSchema,
	data: z.object({
		device: z.string(),
		vip_views: z.number(),
		vip_emailCaptures: z.number(),
		vip_downloads: z.number(),
	}),
});

export const pipe_vipTopOs = tinybird.buildPipe({
	pipe: 'vip_os',
	parameters: stdWebEventPipeParamsSchema,
	data: z.object({
		os: z.string(),
		vip_views: z.number(),
		vip_emailCaptures: z.number(),
		vip_downloads: z.number(),
	}),
});

export const pipe_vipTopCities = tinybird.buildPipe({
	pipe: 'vip_cities',
	parameters: stdWebEventPipeParamsSchema,
	data: z.object({
		city: z.string(),
		region: z.string(),
		country: z.string(),
		vip_views: z.number(),
		vip_emailCaptures: z.number(),
		vip_downloads: z.number(),
	}),
});

export const pipe_vipTopCountries = tinybird.buildPipe({
	pipe: 'vip_countries',
	parameters: stdWebEventPipeParamsSchema,
	data: z.object({
		country: z.string(),
		vip_views: z.number(),
		vip_emailCaptures: z.number(),
		vip_downloads: z.number(),
	}),
});

export const pipe_vipTopRegions = tinybird.buildPipe({
	pipe: 'vip_regions',
	parameters: stdWebEventPipeParamsSchema,
	data: z.object({
		region: z.string(),
		country: z.string(),
		vip_views: z.number(),
		vip_emailCaptures: z.number(),
		vip_downloads: z.number(),
	}),
});

export const pipe_vipTopReferers = tinybird.buildPipe({
	pipe: 'vip_referers',
	parameters: stdWebEventPipeParamsSchema,
	data: z.object({
		referer: z.string(),
		vip_views: z.number(),
		vip_emailCaptures: z.number(),
		vip_downloads: z.number(),
	}),
});

export const pipe_vipTopMetaCampaigns = tinybird.buildPipe({
	pipe: 'vip_metaCampaigns',
	parameters: stdWebEventPipeParamsSchema,
	data: z.object({
		sessionMetaCampaignId: z.string(),
		vip_views: z.number(),
		vip_emailCaptures: z.number(),
		vip_downloads: z.number(),
	}),
});

export const pipe_vipTopMetaAdSets = tinybird.buildPipe({
	pipe: 'vip_metaAdSets',
	parameters: stdWebEventPipeParamsSchema,
	data: z.object({
		sessionMetaAdSetId: z.string(),
		vip_views: z.number(),
		vip_emailCaptures: z.number(),
		vip_downloads: z.number(),
	}),
});

export const pipe_vipTopMetaAds = tinybird.buildPipe({
	pipe: 'vip_metaAds',
	parameters: stdWebEventPipeParamsSchema,
	data: z.object({
		sessionMetaAdId: z.string(),
		vip_views: z.number(),
		vip_emailCaptures: z.number(),
		vip_downloads: z.number(),
	}),
});

export const pipe_vipTopMetaPlacements = tinybird.buildPipe({
	pipe: 'vip_metaPlacements',
	parameters: stdWebEventPipeParamsSchema,
	data: z.object({
		sessionMetaPlacement: z.string(),
		vip_views: z.number(),
		vip_emailCaptures: z.number(),
		vip_downloads: z.number(),
	}),
});

export const pipe_vipTopLandingPages = tinybird.buildPipe({
	pipe: 'vip_landingPages',
	parameters: stdWebEventPipeParamsSchema,
	data: z.object({
		sessionLandingPageId: z.string(),
		vip_views: z.number(),
		vip_emailCaptures: z.number(),
		vip_downloads: z.number(),
	}),
});

export const pipe_vipTopEmailBroadcasts = tinybird.buildPipe({
	pipe: 'vip_emailBroadcasts',
	parameters: stdWebEventPipeParamsSchema,
	data: z.object({
		sessionEmailBroadcastId: z.string(),
		vip_views: z.number(),
		vip_emailCaptures: z.number(),
		vip_downloads: z.number(),
	}),
});

export const pipe_vipTopEmailTemplates = tinybird.buildPipe({
	pipe: 'vip_emailTemplates',
	parameters: stdWebEventPipeParamsSchema,
	data: z.object({
		sessionEmailTemplateId: z.string(),
		vip_views: z.number(),
		vip_emailCaptures: z.number(),
		vip_downloads: z.number(),
	}),
});

export const pipe_vipTopFlowActions = tinybird.buildPipe({
	pipe: 'vip_flowActions',
	parameters: stdWebEventPipeParamsSchema,
	data: z.object({
		sessionFlowActionId: z.string(),
		vip_views: z.number(),
		vip_emailCaptures: z.number(),
		vip_downloads: z.number(),
	}),
});

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

export const pipe_pageTimeseries = tinybird.buildPipe({
	pipe: 'v2_page_timeseries',
	parameters: stdWebEventPipeParamsSchema,
	data: z.object({
		start: z.string(),
		page_views: z.number(),
		page_linkClicks: z.number(),
	}),
});

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
export const pipe_linkTimeseries = tinybird.buildPipe({
	pipe: 'v2_link_timeseries',
	parameters: stdWebEventPipeParamsSchema,
	data: z.object({
		start: z.string(),
		link_clicks: z.number(),
	}),
});
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

// Bio analytics pipes
export const pipe_bioTimeseries = tinybird.buildPipe({
	pipe: 'v2_bio_timeseries',
	parameters: stdWebEventPipeParamsSchema,
	data: z.object({
		start: z.string(),
		bio_views: z.number(),
		bio_buttonClicks: z.number(),
		bio_emailCaptures: z.number(),
		ctr: z.number(),
		email_conversion_rate: z.number(),
		unique_sessions: z.number(),
		total_events: z.number(),
	}),
});

export const pipe_bioButtonStats = tinybird.buildPipe({
	pipe: 'v2_bio_buttonStats',
	parameters: stdWebEventPipeParamsSchema,
	data: z.object({
		buttonUrl: z.string().nullable(),
		clicks: z.number(),
		totalEvents: z.number(),
	}),
});

export const pipe_bioTopBrowsers = tinybird.buildPipe({
	pipe: 'v2_bio_browsers',
	parameters: stdWebEventPipeParamsSchema,
	data: topBrowsersPipeDataSchema,
});

export const pipe_bioTopDevices = tinybird.buildPipe({
	pipe: 'v2_bio_devices',
	parameters: stdWebEventPipeParamsSchema,
	data: topDevicesPipeDataSchema,
});

export const pipe_bioTopOs = tinybird.buildPipe({
	pipe: 'v2_bio_os',
	parameters: stdWebEventPipeParamsSchema,
	data: topOsPipeDataSchema,
});

export const pipe_bioTopCities = tinybird.buildPipe({
	pipe: 'v2_bio_cities',
	parameters: stdWebEventPipeParamsSchema,
	data: z.object({
		bio_views: z.number(),
		bio_buttonClicks: z.number(),
		bio_emailCaptures: z.number(),
		city: z.string(),
		region: z.string(),
		country: z.string(),
	}),
});

export const pipe_bioTopCountries = tinybird.buildPipe({
	pipe: 'v2_bio_countries',
	parameters: stdWebEventPipeParamsSchema,
	data: z.object({
		bio_views: z.number(),
		bio_buttonClicks: z.number(),
		bio_emailCaptures: z.number(),
		country: z.string(),
	}),
});

export const pipe_bioTopReferers = tinybird.buildPipe({
	pipe: 'v2_bio_referers',
	parameters: stdWebEventPipeParamsSchema,
	data: z.object({
		bio_views: z.number(),
		bio_buttonClicks: z.number(),
		bio_emailCaptures: z.number(),
		referer: z.string(),
	}),
});

export const pipe_bioTopRegions = tinybird.buildPipe({
	pipe: 'v2_bio_regions',
	parameters: stdWebEventPipeParamsSchema,
	data: z.object({
		bio_views: z.number(),
		bio_buttonClicks: z.number(),
		bio_emailCaptures: z.number(),
		region: z.string(),
		country: z.string(),
	}),
});

// New bio analytics pipes for production dashboards
export const pipe_bioConversionFunnel = tinybird.buildPipe({
	pipe: 'v2_bio_conversion_funnel',
	parameters: stdWebEventPipeParamsSchema,
	data: z.object({
		total_sessions: z.number(),
		sessions_with_views: z.number(),
		sessions_with_clicks: z.number(),
		sessions_with_emails: z.number(),
		total_views: z.number(),
		total_clicks: z.number(),
		total_email_captures: z.number(),
		view_to_click_rate: z.number(),
		view_to_email_rate: z.number(),
		click_to_email_rate: z.number(),
		clicks_per_view: z.number(),
		avg_views_per_session: z.number(),
		avg_clicks_per_session: z.number(),
		bounced_sessions: z.number(),
		bounce_rate: z.number(),
	}),
});

export const pipe_bioEngagementMetrics = tinybird.buildPipe({
	pipe: 'v2_bio_engagement_metrics',
	parameters: stdWebEventPipeParamsSchema,
	data: z.object({
		total_sessions: z.number(),
		avg_session_duration: z.number(),
		median_session_duration: z.number(),
		max_session_duration: z.number(),
		avg_clicks_per_session: z.number(),
		overall_ctr: z.number(),
		session_click_rate: z.number(),
		avg_emails_per_session: z.number(),
		session_email_rate: z.number(),
		engagement_score: z.number(),
		avg_events_per_session: z.number(),
		quick_bounces: z.number(),
		sessions_without_clicks: z.number(),
		quick_bounce_rate: z.number(),
		no_click_rate: z.number(),
		sessions_0_10s: z.number(),
		sessions_10_30s: z.number(),
		sessions_30_60s: z.number(),
		sessions_1_3m: z.number(),
		sessions_over_3m: z.number(),
	}),
});

export const pipe_bioBlockPerformance = tinybird.buildPipe({
	pipe: 'v2_bio_block_performance',
	parameters: stdWebEventPipeParamsSchema.extend({
		blockType: z.string().optional(),
	}),
	data: z.object({
		block_type: z.string().nullable(),
		block_position: z.number().nullable(),
		block_id: z.string().nullable(),
		unique_sessions: z.number(),
		total_interactions: z.number(),
		total_clicks: z.number(),
		sessions_with_clicks: z.number(),
		block_click_rate: z.number(),
		total_email_captures: z.number(),
		sessions_with_emails: z.number(),
		marketing_opt_ins: z.number(),
		marketing_opt_in_rate: z.number(),
		avg_position: z.number(),
		position_category: z.string(),
	}),
});

export const pipe_bioLinkPerformance = tinybird.buildPipe({
	pipe: 'v2_bio_link_performance',
	parameters: stdWebEventPipeParamsSchema.extend({
		linkId: z.string().optional(),
		blockId: z.string().optional(),
		animation: z.string().optional(),
	}),
	data: z.object({
		link_id: z.string().nullable(),
		link_text: z.string().nullable(),
		destination_url: z.string().nullable(),
		link_position: z.number().nullable(),
		animation_type: z.string().nullable(),
		block_id: z.string().nullable(),
		block_type: z.string().nullable(),
		block_position: z.number().nullable(),
		total_clicks: z.number(),
		unique_sessions: z.number(),
		position_in_block: z.string(),
		avg_click_hour: z.number(),
		avg_click_day_of_week: z.number(),
		mobile_clicks: z.number(),
		desktop_clicks: z.number(),
		tablet_clicks: z.number(),
		mobile_click_share: z.number(),
	}),
});

export const pipe_bioAnimationPerformance = tinybird.buildPipe({
	pipe: 'v2_bio_animation_performance',
	parameters: stdWebEventPipeParamsSchema,
	data: z.object({
		animation: z.string().nullable(),
		links_with_animation: z.number(),
		total_clicks: z.number(),
		total_unique_sessions: z.number(),
		avg_clicks_per_link: z.number(),
		avg_sessions_per_link: z.number(),
		improvement_over_baseline_percent: z.number(),
		click_variance: z.number(),
		click_std_dev: z.number(),
		statistical_confidence: z.string(),
		performance_rank: z.number(),
	}),
});
