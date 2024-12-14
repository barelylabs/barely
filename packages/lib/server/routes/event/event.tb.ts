import { z } from 'zod';

import { formattedUserAgentSchema, nextGeoSchema } from '../../next/next.schema';
import { tinybird } from '../../tinybird/client';
import { FM_LINK_PLATFORMS } from '../fm/fm.constants';

// schema
export const visitorSessionTinybirdSchema = z
	.object({
		fanId: z.string().nullish(),
		fbclid: z.string().nullish(),
		referer: z
			.string()
			.nullish()
			.transform(s => s ?? '(direct)'),
		referer_url: z
			.string()
			.nullish()
			.transform(s => s ?? '(direct)'),
		sessionEmailBroadcastId: z.string().nullish(),
		sessionEmailTemplateId: z.string().nullish(),
		sessionFlowActionId: z.string().nullish(),
		sessionId: z.string(),
		sessionLandingPageId: z.string().nullish(),
		sessionMetaCampaignId: z.string().nullish(),
		sessionMetaAdsetId: z.string().nullish(),
		sessionMetaAdId: z.string().nullish(),
		sessionMetaPlacement: z.string().nullish(),
		sessionReferer: z
			.string()
			.nullish()
			.transform(s => s ?? '(direct)'),
		sessionRefererId: z
			.string()
			.nullish()
			.transform(s => s ?? null),
		sessionRefererUrl: z
			.string()
			.nullish()
			.transform(s => s ?? '(direct)'),

		// deprecated
		referer_id: z
			.string()
			.nullish()
			.transform(s => s ?? ''), // deprecated
	})
	.merge(nextGeoSchema)
	.merge(formattedUserAgentSchema);

export const reportedEventTinybirdSchema = z.object({
	reportedToMeta: z.string().optional().default(''),
	reportedToTiktok: z.string().optional().default(''),
});

export const WEB_EVENT_TYPES__CART = [
	'cart/viewCheckout', // ✅
	'cart/updateMainProductPayWhatYouWantPrice',
	'cart/addEmail', // ✅ not reported to meta
	'cart/addShippingInfo', // ✅ not reported to meta
	'cart/addPaymentInfo', // ✅
	'cart/addBump', // ✅
	'cart/removeBump', // ✅ not reported to meta
	'cart/purchaseMainWithoutBump', // ✅
	'cart/purchaseMainWithBump', // ✅
	'cart/viewUpsell', // ✅
	'cart/declineUpsell', // ✅ not reported to meta
	'cart/purchaseUpsell', // ✅
	'cart/viewOrderConfirmation', // ✅ not reported to meta
] as const;

export const WEB_EVENT_TYPES__FM = ['fm/view', 'fm/linkClick'] as const;

export const WEB_EVENT_TYPES__LINK = ['link/click'] as const;

export const WEB_EVENT_TYPES__PAGE = ['page/view', 'page/linkClick'] as const;

export const WEB_EVENT_TYPES = [
	...WEB_EVENT_TYPES__CART,
	...WEB_EVENT_TYPES__FM,
	...WEB_EVENT_TYPES__LINK,
	...WEB_EVENT_TYPES__PAGE,
] as const;

export type WebEventType = (typeof WEB_EVENT_TYPES)[number];

// publish web events
export const webEventIngestSchema = z
	.object({
		workspaceId: z.string(),

		// where the event happened
		assetId: z.string(),
		href: z.string(),
		key: z.string().optional().default(''), // link, cartFunnel, page, fm

		// short link data
		linkType: z.enum(['short', 'transparent', '']).optional().default(''), // deprecated
		domain: z.string().optional().default(''),

		// destination
		platform: z
			.enum([...FM_LINK_PLATFORMS, ''])
			.optional()
			.default(''),
		// linkClick data
		linkClickDestinationAssetId: z
			.string()
			.nullish()
			.transform(s => s ?? ''),
		linkClickDestinationHref: z
			.string()
			.nullish()
			.transform(s => s ?? ''),

		// event data
		timestamp: z.string().datetime(),
		type: z.enum([
			...WEB_EVENT_TYPES__CART,
			...WEB_EVENT_TYPES__FM,
			...WEB_EVENT_TYPES__LINK,
			...WEB_EVENT_TYPES__PAGE,
		]),
	})
	.merge(visitorSessionTinybirdSchema)
	.merge(reportedEventTinybirdSchema);

export const ingestWebEvent = tinybird.buildIngestEndpoint({
	datasource: 'barely_events',
	event: webEventIngestSchema,
});

export const cartEventIngestSchema = z.object({
	cart_landingPageId: z.string().nullish().default(''),
	cart_landingPage_mainProductId: z.string().nullish().default(''),

	cart_checkout_mainProductId: z.string().nullish().default(''),
	cart_checkout_mainProductPrice: z.number().nullish().default(0),
	cart_checkout_mainProductPayWhatYouWant: z.boolean().nullish().default(false),

	cart_checkout_bumpProductId: z.string().nullish().default(''),
	cart_checkout_bumpProductPrice: z.number().nullish().default(0),

	cart_checkoutPurchase_mainProductPrice: z.number().nullish().default(0),
	cart_checkoutPurchase_mainProductQuantity: z.number().nullish().default(0),
	cart_checkoutPurchase_mainProductAmount: z.number().nullish().default(0),
	cart_checkoutPurchase_mainShippingAmount: z.number().nullish().default(0),
	cart_checkoutPurchase_mainHandlingAmount: z.number().nullish().default(0),

	cart_checkoutPurchase_bumpProductPrice: z.number().nullish().default(0),
	cart_checkoutPurchase_bumpProductQuantity: z.number().nullish().default(0),
	cart_checkoutPurchase_bumpProductAmount: z.number().nullish().default(0),
	cart_checkoutPurchase_bumpShippingAmount: z.number().nullish().default(0),
	cart_checkoutPurchase_bumpHandlingAmount: z.number().nullish().default(0),

	cart_checkoutPurchase_productAmount: z.number().nullish().default(0),
	cart_checkoutPurchase_shippingAmount: z.number().nullish().default(0),
	cart_checkoutPurchase_handlingAmount: z.number().nullish().default(0),
	cart_checkoutPurchase_amount: z.number().nullish().default(0),

	cart_upsell_upsellProductId: z.string().nullish().default(''),
	cart_upsellPurchase_upsellProductPrice: z.number().nullish().default(0),
	cart_upsellPurchase_upsellProductQuantity: z.number().nullish().default(0),
	cart_upsellPurchase_upsellProductAmount: z.number().nullish().default(0),
	cart_upsellPurchase_upsellShippingAmount: z.number().nullish().default(0),
	cart_upsellPurchase_upsellHandlingAmount: z.number().nullish().default(0),
	cart_upsellPurchase_amount: z.number().nullish().default(0),

	cart_upsellPurchase_orderProductAmount: z.number().nullish().default(0),
	cart_upsellPurchase_orderShippingAmount: z.number().nullish().default(0),
	cart_upsellPurchase_orderHandlingAmount: z.number().nullish().default(0),
	cart_upsellPurchase_orderAmount: z.number().nullish().default(0),
});

export const ingestCartEvent = tinybird.buildIngestEndpoint({
	datasource: 'barely_events',
	event: webEventIngestSchema.merge(cartEventIngestSchema),
});

export const fmEventIngestSchema = z.object({
	fmLinkPlatform: z
		.enum([...FM_LINK_PLATFORMS, ''])
		.optional()
		.default(''),
});

export const ingestFmEvent = tinybird.buildIngestEndpoint({
	datasource: 'barely_events',
	event: webEventIngestSchema.merge(fmEventIngestSchema),
});

/* page */
export const ingestPageEvent = tinybird.buildIngestEndpoint({
	datasource: 'barely_events',
	event: webEventIngestSchema,
});
