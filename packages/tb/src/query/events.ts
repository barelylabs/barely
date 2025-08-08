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
