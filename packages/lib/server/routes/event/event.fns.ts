import type { z } from 'zod';
import { eq } from 'drizzle-orm';

import type { VisitorInfo } from '../../../utils/middleware';
import type { MetaEventProps } from '../../meta/meta.endpts.event';
import type { CartFunnel } from '../cart-funnel/cart-funnel.schema';
import type { Cart } from '../cart/cart.schema';
import type { LinkAnalyticsProps } from '../link/link.schema';
import type {
	cartEventIngestSchema,
	WEB_EVENT_TYPES__CART,
	WEB_EVENT_TYPES__LINK,
} from './event.tb';
import { env } from '../../../env';
import { newId } from '../../../utils/id';
import { log } from '../../../utils/log';
import { sqlIncrement } from '../../../utils/sql';
import { ratelimit } from '../../../utils/upstash';
import { db } from '../../db';
import { reportEventToMeta } from '../../meta/meta.endpts.event';
import { AnalyticsEndpoints } from '../analytics-endpoint/analytics-endpoint.sql';
import { Links } from '../link/link.sql';
import { Workspaces } from '../workspace/workspace.sql';
import { ingestCartEvent, ingestWebEvent, webEventIngestSchema } from './event.tb';

/**
 * Record clicks with geo, ua, referer, and timestamp data
 * If linkId is not specified, it's a root click (key="_root", eg. properyouth.barely.link, or properyouth.link)
 */

// export type RecordClickProp = z.infer<typeof visitorSessionTinybirdSchema>;

export interface RecordClickProps extends VisitorInfo {
	link: LinkAnalyticsProps;
	type: (typeof WEB_EVENT_TYPES__LINK)[number];
	href: string;
}

export async function recordLinkClick({
	link,
	type,
	href,
	ip,
	geo,
	userAgent: ua,
	referer,
	referer_url,
	isBot,
}: RecordClickProps) {
	if (isBot) return null;

	// deduplicate clicks from the same ip & linkId - only record 1 link click per ip per linkId per hour
	const rateLimitPeriod =
		env.RATE_LIMIT_RECORD_LINK_CLICK ?? env.VERCEL_ENV === 'development' ? '1 s' : '1 h';

	const { success } = await ratelimit(10, rateLimitPeriod).limit(
		`recordClick:${ip}:${link.id ?? '_root'}`,
	);

	if (!success) return null;

	const time = Date.now();
	const timestamp = new Date(time).toISOString();

	// increment the link click count in db
	await db.http
		.update(Links)
		.set({ clicks: sqlIncrement(Links.clicks) })
		.where(eq(Links.id, link.id));

	// increment the workspace link usage count in db
	await db.http
		.update(Workspaces)
		.set({ linkUsage: sqlIncrement(Workspaces.linkUsage) })
		.where(eq(Workspaces.id, link.workspaceId));

	/**
	 * 👾 remarketing/analytics 👾
	 *  */

	const analyticsEndpoints =
		link.remarketing ?
			await db.pool.query.AnalyticsEndpoints.findMany({
				where: eq(AnalyticsEndpoints.workspaceId, link.workspaceId),
			})
		:	[];

	// ∞ Meta ∞
	const metaPixel = analyticsEndpoints.find(endpoint => endpoint.platform === 'meta');

	await log({
		type: 'link',
		fn: 'recordLinkClick',
		message: `metaPixel => ${metaPixel?.id}`,
	});

	const metaRes =
		metaPixel?.accessToken ?
			await reportEventToMeta({
				pixelId: metaPixel.id,
				accessToken: metaPixel.accessToken,
				url: href,
				ip,
				ua: ua.ua,
				eventName: 'Barely_LinkClick',
				geo,
			})
		:	{ reported: false };

	await log({
		type: 'link',
		fn: 'recordLinkClick',
		message: `metaRes => ${JSON.stringify(metaRes)}`,
	});

	// ♪ TikTok ♪

	/**
	 * 👾 end remarketing/analytics 👾
	 */

	// report event to tinybird

	try {
		const eventData = webEventIngestSchema.parse({
			timestamp,
			workspaceId: link.workspaceId,
			assetId: link.id,
			sessionId: newId('webSession'),
			href,
			// link specifics (short link or transparent link)
			type,
			domain: type === 'shortLinkClick' ? link.domain : undefined,
			key: type === 'shortLinkClick' ? link.key : undefined,
			// analytics
			...geo,
			...ua,
			referer,
			referer_url,
			reportedToMeta: metaPixel && metaRes.reported ? metaPixel.id : 'false',
		});

		const tinybirdRes = await ingestWebEvent(eventData);

		console.log('tinybirdRes => ', tinybirdRes);
	} catch (error) {
		console.log('error => ', error);
		throw new Error('ah!');
	}

	// console.log('tinybirdRes => ', tinybirdRes);

	return true;
}

interface RecordCartEventProps {
	cart: Cart;
	cartFunnel: CartFunnel;
	type: (typeof WEB_EVENT_TYPES__CART)[number];
	visitor?: VisitorInfo;
}

export async function recordCartEvent({
	cart,
	cartFunnel,
	type,
	visitor,
}: RecordCartEventProps) {
	const visitorInfo: VisitorInfo = {
		ip: cart.visitorIp ?? visitor?.ip ?? 'Unknown',
		geo: {
			country: cart.visitorGeo?.country ?? visitor?.geo.country ?? 'Unknown',
			region: cart.visitorGeo?.region ?? visitor?.geo.region ?? 'Unknown',
			city: cart.visitorGeo?.city ?? visitor?.geo.city ?? 'Unknown',
			latitude: cart.visitorGeo?.latitude ?? visitor?.geo.latitude ?? 'Unknown',
			longitude: cart.visitorGeo?.longitude ?? visitor?.geo.longitude ?? 'Unknown',
		},
		userAgent: {
			ua: cart.visitorUserAgent?.ua ?? visitor?.userAgent.ua ?? 'Unknown',
			browser: cart.visitorUserAgent?.browser ?? visitor?.userAgent.browser ?? 'Unknown',
			browser_version:
				cart.visitorUserAgent?.browser_version ??
				visitor?.userAgent.browser_version ??
				'Unknown',
			engine: cart.visitorUserAgent?.engine ?? visitor?.userAgent.engine ?? 'Unknown',
			engine_version:
				cart.visitorUserAgent?.engine_version ??
				visitor?.userAgent.engine_version ??
				'Unknown',
			os: cart.visitorUserAgent?.os ?? visitor?.userAgent.os ?? 'Unknown',
			os_version:
				cart.visitorUserAgent?.os_version ?? visitor?.userAgent.os_version ?? 'Unknown',
			device: cart.visitorUserAgent?.device ?? visitor?.userAgent.device ?? 'Unknown',
			device_vendor:
				cart.visitorUserAgent?.device_vendor ??
				visitor?.userAgent.device_vendor ??
				'Unknown',
			device_model:
				cart.visitorUserAgent?.device_model ??
				visitor?.userAgent.device_model ??
				'Unknown',
			cpu_architecture:
				cart.visitorUserAgent?.cpu_architecture ??
				visitor?.userAgent.cpu_architecture ??
				'Unknown',
			bot: cart.visitorUserAgent?.bot ?? visitor?.userAgent.bot ?? false,
		},
		referer: cart.visitorReferer ?? visitor?.referer ?? 'Unknown',
		referer_url: cart.visitorRefererUrl ?? visitor?.referer_url ?? 'Unknown',
		isBot: visitor?.isBot ?? false,
		href: visitor?.href ?? 'Unknown',
	};

	if (visitorInfo.isBot) return null;

	// deduplication events from the same ip & cartId - only record 1 cart event per ip per cartId per hour
	const rateLimitPeriod = env.RATE_LIMIT_RECORD_CART_EVENT ?? '1 h';

	const { success } = await ratelimit(10, rateLimitPeriod).limit(
		`recordCartEvent:${visitorInfo.ip}:${cart.id}:${type}`,
	);

	if (!success) {
		console.log('rate limit exceeded for ', visitorInfo.ip, cart.id, type);
		return null;
	}

	const timestamp = new Date(Date.now()).toISOString();

	const analyticsEndpoints = await db.pool.query.AnalyticsEndpoints.findMany({
		where: eq(AnalyticsEndpoints.workspaceId, cart.workspaceId),
	});

	// ∞ Meta ∞
	const metaPixel = analyticsEndpoints.find(endpoint => endpoint.platform === 'meta');
	const metaEvent = getMetaEventFromCartEvent({
		cart,
		funnel: cartFunnel,
		eventType: type,
	});
	const metaRes =
		metaPixel?.accessToken && metaEvent ?
			await reportEventToMeta({
				pixelId: metaPixel.id,
				accessToken: metaPixel.accessToken,
				url: visitorInfo.href,
				ip: visitorInfo.ip,
				ua: visitorInfo.userAgent.ua,
				geo: visitorInfo.geo,
				eventName: metaEvent.eventName,
				customData: metaEvent.customData,
			}).catch(err => {
				console.log('err reporting cart event to meta => ', err);
				return { reported: false };
			})
		:	{ reported: false };

	// ♪ TikTok ♪

	// 🐦 report event to tinybird
	try {
		const cartEventData = getCartEventData({ cart, eventType: type });
		const tinybirdRes = await ingestCartEvent({
			timestamp,
			workspaceId: cart.workspaceId,
			assetId: cartFunnel.id,
			sessionId: cart.id,
			href: visitorInfo.href,
			type,
			key: cartFunnel.key,
			// analytics
			...visitorInfo.geo,
			...visitorInfo.userAgent,
			referer: visitorInfo.referer,
			referer_url: visitorInfo.referer_url,
			reportedToMeta: metaPixel && metaRes.reported ? metaPixel.id : 'false',
			// cart specifics
			...cartEventData,
		});

		console.log('tinybirdRes for cart event => ', tinybirdRes);
	} catch (error) {
		console.log('error => ', error);
		throw new Error('ah!');
	}
}

function getMetaEventFromCartEvent({
	cart,
	eventType,
}: {
	cart: Cart;
	funnel: CartFunnel;
	eventType: (typeof WEB_EVENT_TYPES__CART)[number];
}): {
	eventName: MetaEventProps['eventName'];
	customData: MetaEventProps['customData'];
} | null {
	switch (eventType) {
		case 'cart_viewLandingPage':
			if (!cart.landingPageId) return null;
			return {
				eventName: 'ViewContent',
				customData: {
					content_ids: [cart.mainProductId],
					content_name: cart.landingPageId,
					content_type: 'product',
				},
			};
		case 'cart_initiateCheckout':
			return {
				eventName: 'InitiateCheckout',
				customData: {
					content_ids: [cart.mainProductId],
					content_type: 'product',
					currency: 'USD',
					value: cart.mainProductPrice,
				},
			};

		// case 'cart_addEmail':
		// 	return {
		// 		eventName: 'Barely_AddEmail',
		// 		customData: {
		// 			content_ids: [cart.mainProductId],
		// 			content_type: 'product',
		// 		},
		// 	};

		// case 'cart_addShippingInfo':
		// 	return {
		// 		eventName: 'Barely_AddShippingInfo',
		// 		customData: {
		// 			content_ids: [cart.mainProductId],
		// 			content_type: 'product',
		// 		},
		// 	};

		case 'cart_addPaymentInfo':
			return {
				eventName: 'AddPaymentInfo',
				customData: {
					content_ids: [cart.mainProductId],
					content_type: 'product',
					currency: 'USD',
					value: cart.checkoutAmount,
				},
			};
		case 'cart_addBump':
			if (!cart.bumpProductId) return null;
			return {
				eventName: 'AddToCart',
				customData: {
					content_ids: [cart.bumpProductId],
					content_type: 'product',
					currency: 'USD',
					value: cart.bumpProductPrice ?? 0,
				},
			};
		case 'cart_purchaseMainWithoutBump':
			return {
				eventName: 'Purchase',
				customData: {
					content_ids: [cart.mainProductId],
					content_type: 'product',
					currency: 'USD',
					value: cart.checkoutAmount,
				},
			};
		case 'cart_purchaseMainWithBump':
			if (!cart.bumpProductId) return null;
			return {
				eventName: 'Purchase',
				customData: {
					content_ids: [cart.mainProductId, cart.bumpProductId],
					content_type: 'product',
					currency: 'USD',
					value: cart.checkoutAmount,
				},
			};
		case 'cart_viewUpsell':
			if (!cart.upsellProductId) return null;
			return {
				eventName: 'ViewContent',
				customData: {
					content_ids: [cart.upsellProductId],
					content_type: 'product',
				},
			};
		case 'cart_purchaseUpsell':
			if (!cart.upsellProductId) return null;
			return {
				eventName: 'Purchase',
				customData: {
					content_ids: [cart.upsellProductId],
					content_type: 'product',
					currency: 'USD',
					value: cart.upsellProductPrice ?? 0,
				},
			};
		default:
			return null;
	}
}

function getCartEventData({
	cart,
	eventType,
}: {
	cart: Cart;
	eventType: (typeof WEB_EVENT_TYPES__CART)[number];
}): Partial<z.infer<typeof cartEventIngestSchema>> {
	switch (eventType) {
		case 'cart_viewLandingPage':
			return {
				cart_landingPageId: cart.landingPageId,
				cart_landingPage_mainProductId: cart.mainProductId,
			};

		case 'cart_initiateCheckout':
			return {
				cart_checkout_mainProductId: cart.mainProductId,
				cart_checkout_mainProductPrice: cart.mainProductPrice,
				cart_checkout_mainProductPayWhatYouWant: cart.mainProductPayWhatYouWant,
				cart_checkout_bumpProductId: cart.bumpProductId,
				cart_checkout_bumpProductPrice: cart.bumpProductPrice,
			};

		case 'cart_addPaymentInfo':
			return {
				cart_checkout_mainProductId: cart.mainProductId,
				cart_checkout_mainProductPrice: cart.mainProductPrice,
				cart_checkout_mainProductPayWhatYouWant: cart.mainProductPayWhatYouWant,
				cart_checkout_bumpProductId: cart.bumpProductId,
				cart_checkout_bumpProductPrice: cart.bumpProductPrice,
			};

		case 'cart_addBump':
			return {
				cart_checkout_mainProductId: cart.mainProductId,
				cart_checkout_mainProductPrice: cart.mainProductPrice,
				cart_checkout_mainProductPayWhatYouWant: cart.mainProductPayWhatYouWant,
				cart_checkout_bumpProductId: cart.bumpProductId,
				cart_checkout_bumpProductPrice: cart.bumpProductPrice,
			};

		case 'cart_removeBump':
			return {
				cart_checkout_mainProductId: cart.mainProductId,
				cart_checkout_mainProductPrice: cart.mainProductPrice,
				cart_checkout_mainProductPayWhatYouWant: cart.mainProductPayWhatYouWant,
				cart_checkout_bumpProductId: cart.bumpProductId,
				cart_checkout_bumpProductPrice: cart.bumpProductPrice,
			};

		case 'cart_purchaseMainWithoutBump':
			return {
				cart_checkout_mainProductId: cart.mainProductId,
				cart_checkoutPurchase_mainProductPrice: cart.mainProductPrice,
				cart_checkoutPurchase_mainProductQuantity: cart.mainProductQuantity,
				cart_checkoutPurchase_mainProductAmount: cart.mainProductAmount,
				cart_checkoutPurchase_mainShippingAmount: cart.mainShippingAmount,
				cart_checkoutPurchase_mainHandlingAmount: cart.mainHandlingAmount,

				cart_checkoutPurchase_productAmount: cart.mainProductAmount,
				cart_checkoutPurchase_shippingAmount: cart.mainShippingAmount,
				cart_checkoutPurchase_handlingAmount: cart.mainHandlingAmount,
				cart_checkoutPurchase_amount: cart.checkoutAmount,

				// maybe insight into why bump was not purchased
				cart_checkout_bumpProductId: cart.bumpProductId,
				cart_checkout_bumpProductPrice: cart.bumpProductPrice,
			};
		case 'cart_purchaseMainWithBump':
			return {
				cart_checkout_mainProductId: cart.mainProductId,
				cart_checkoutPurchase_mainProductPrice: cart.mainProductPrice,
				cart_checkoutPurchase_mainProductQuantity: cart.mainProductQuantity,
				cart_checkoutPurchase_mainProductAmount: cart.mainProductAmount,
				cart_checkoutPurchase_mainShippingAmount: cart.mainShippingAmount,
				cart_checkoutPurchase_mainHandlingAmount: cart.mainHandlingAmount,

				cart_checkout_bumpProductId: cart.bumpProductId,
				cart_checkoutPurchase_bumpProductPrice: cart.bumpProductPrice,
				cart_checkoutPurchase_bumpProductQuantity: cart.bumpProductQuantity,
				cart_checkoutPurchase_bumpProductAmount: cart.bumpProductAmount,
				cart_checkoutPurchase_bumpShippingAmount: cart.bumpShippingAmount,
				cart_checkoutPurchase_bumpHandlingAmount: cart.bumpHandlingAmount,

				cart_checkoutPurchase_productAmount: cart.checkoutProductAmount,
				cart_checkoutPurchase_shippingAmount: cart.checkoutShippingAmount,
				cart_checkoutPurchase_handlingAmount: cart.checkoutHandlingAmount,
				cart_checkoutPurchase_amount: cart.checkoutAmount,
			};

		case 'cart_viewUpsell':
			return {
				cart_upsell_upsellProductId: cart.upsellProductId,
			};

		case 'cart_declineUpsell':
			return {
				// maybe insight into why upsell was declined
				cart_checkoutPurchase_amount: cart.checkoutAmount,

				cart_upsell_upsellProductId: cart.upsellProductId,
			};

		case 'cart_purchaseUpsell':
			return {
				cart_checkoutPurchase_amount: cart.checkoutAmount,

				cart_upsell_upsellProductId: cart.upsellProductId,
				cart_upsellPurchase_upsellProductPrice: cart.upsellProductPrice,
				cart_upsellPurchase_upsellProductQuantity: cart.upsellProductQuantity,
				cart_upsellPurchase_upsellProductAmount: cart.upsellProductAmount,
				cart_upsellPurchase_upsellShippingAmount: cart.upsellShippingAmount,
				cart_upsellPurchase_upsellHandlingAmount: cart.upsellHandlingAmount,
				cart_upsellPurchase_amount: cart.upsellAmount,
			};

		case 'cart_viewOrderConfirmation':
			return {};

		default:
			return {};
	}
}
