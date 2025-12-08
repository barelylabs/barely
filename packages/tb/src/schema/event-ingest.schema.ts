import {
	BIO_BLOCK_ANIMATION_TYPES,
	BIO_BLOCK_TYPES,
	FM_LINK_PLATFORMS,
	WEB_EVENT_TYPES,
} from '@barely/const';
import { formattedUserAgentSchema, nextGeoSchema } from '@barely/db/schema';
import { z } from 'zod/v4';

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
	.extend(nextGeoSchema.shape)
	.extend(formattedUserAgentSchema.shape);

export const reportedEventTinybirdSchema = z.object({
	reportedToMeta: z.string().optional().default(''),
	reportedToTiktok: z.string().optional().default(''),
});

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
		type: z.enum(WEB_EVENT_TYPES),

		// journey tracking
		journeyId: z.string().optional().default(''),
		journeyOrigin: z.string().optional().default(''),
		journeySource: z.string().optional().default(''),
		journeyStep: z.number().optional().default(1),
		journeyPath: z.array(z.string()).optional().default([]),
	})
	.extend(visitorSessionTinybirdSchema.shape)
	.extend(reportedEventTinybirdSchema.shape);

export const bioEventIngestSchema = webEventIngestSchema.extend({
	bio_blockId: z.string().nullish(),
	bio_blockType: z.enum(BIO_BLOCK_TYPES).nullish(),
	bio_blockIndex: z.number().nullish(),
	bio_linkId: z.string().nullish(),
	bio_linkIndex: z.number().nullish(),
	bio_linkText: z.string().nullish(),
	bio_linkAnimation: z.enum(BIO_BLOCK_ANIMATION_TYPES).nullish(),
	bio_emailMarketingOptIn: z.boolean().nullish(),
	bio_smsMarketingOptIn: z.boolean().nullish(),
});

export const cartEventIngestSchema = webEventIngestSchema.extend({
	// Cart-specific session for backward compatibility
	cartSessionId: z.string().optional().default(''),

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

export const fmEventIngestSchema = webEventIngestSchema.extend({
	fmLinkPlatform: z
		.enum([...FM_LINK_PLATFORMS, ''])
		.optional()
		.default(''),
});

export const pageEventIngestSchema = webEventIngestSchema;

export const vipEventIngestSchema = webEventIngestSchema.extend({
	vipSwapType: z
		.enum(['contact', 'presave', 'presave-forever', ''])
		.optional()
		.default(''),
	vipDownloadToken: z.string().optional().default(''),
	vipEmailCaptured: z.string().optional().default(''),
});

export const emailEventIngestSchema = webEventIngestSchema.extend({
	timestamp: z.string().datetime(),
	type: z.enum(['bounced', 'delivered', 'opened', 'clicked', 'complained']),
	fanId: z.string(),
	emailTemplateId: z.string(),

	subject: z.string(),
	from: z.string(),
	to: z.string(),
	clickDestinationAssetId: z.string().nullable(),
	clickDestinationHref: z.string().nullable(),

	flowId: z.string().nullable(),
	flowActionId: z.string().nullable(),
	emailBroadcastId: z.string().nullable(),
	resendId: z.string().nullable(),
});
