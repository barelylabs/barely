import type { z } from 'zod';
import { cookies } from 'next/headers';
import { eq } from 'drizzle-orm';

import type { VisitorInfo } from '../../../utils/middleware';
import type { MetaEvent } from '../../meta/meta.endpts.event';
import type { CartFunnel } from '../cart-funnel/cart-funnel.schema';
import type { Cart } from '../cart/cart.schema';
import type { FM_LINK_PLATFORMS } from '../fm/fm.constants';
import type { FmLink, FmPage } from '../fm/fm.schema';
import type { LandingPage } from '../landing-page/landing-page.schema';
import type { LinkAnalyticsProps } from '../link/link.schema';
import type {
	cartEventIngestSchema,
	WEB_EVENT_TYPES__CART,
	WEB_EVENT_TYPES__FM,
	WEB_EVENT_TYPES__PAGE,
} from './event.tb';
import { env } from '../../../env';
import { isDevelopment } from '../../../utils/environment';
import { newId } from '../../../utils/id';
import { log } from '../../../utils/log';
import { sqlIncrement } from '../../../utils/sql';
import { ratelimit } from '../../../utils/upstash';
import { dbHttp } from '../../db';
// import { db } from '../../db';
import { reportEventsToMeta } from '../../meta/meta.endpts.event';
import { AnalyticsEndpoints } from '../analytics-endpoint/analytics-endpoint.sql';
import { FmLinks, FmPages } from '../fm/fm.sql';
import { LandingPages } from '../landing-page/landing-page.sql';
import { Links } from '../link/link.sql';
import { Workspaces } from '../workspace/workspace.sql';
import {
	ingestCartEvent,
	ingestFmEvent,
	ingestPageEvent,
	ingestWebEvent,
	webEventIngestSchema,
} from './event.tb';

/**
 * Record clicks with geo, ua, referer, and timestamp data
 * If linkId is not specified, it's a root click (key="_root", eg. properyouth.barely.link, or properyouth.link)
 */

// export type RecordClickProp = z.infer<typeof visitorSessionTinybirdSchema>;

export interface RecordClickProps extends VisitorInfo {
	link: LinkAnalyticsProps;
	type: 'short' | 'transparent';
	href: string;
	platform?: (typeof FM_LINK_PLATFORMS)[number];
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
	platform,
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
	await dbHttp
		.update(Links)
		.set({ clicks: sqlIncrement(Links.clicks) })
		.where(eq(Links.id, link.id));

	// increment the workspace link usage count in db
	await dbHttp
		.update(Workspaces)
		.set({ linkUsage: sqlIncrement(Workspaces.linkUsage) })
		.where(eq(Workspaces.id, link.workspaceId));

	/**
	 * 👾 remarketing/analytics 👾
	 *  */
	const analyticsEndpoints =
		link.remarketing ?
			await dbHttp.query.AnalyticsEndpoints.findMany({
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

	const fbclid = new URL(href).searchParams.get('fbclid');
	const sourceUrl = href; // this is being logged directly from middleware, so href is the sourceUrl

	const metaRes =
		metaPixel?.accessToken ?
			await reportEventsToMeta({
				pixelId: metaPixel.id,
				accessToken: metaPixel.accessToken,
				sourceUrl,
				fbclid,
				ip,
				ua: ua.ua,
				geo,
				events: [
					{
						eventName: 'barely.link/click',
						customData: {
							linkType: type,
							platform,
						},
					},
				],
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
			domain: type === 'short' ? link.domain : undefined,
			key: type === 'short' ? link.key : undefined,
			// analytics
			...geo,
			...ua,
			platform,
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

/* CART */

export async function recordCartEvent({
	cart,
	cartFunnel,
	type,
	visitor,
}: {
	cart: Cart;
	cartFunnel: CartFunnel;
	type: (typeof WEB_EVENT_TYPES__CART)[number];
	visitor?: VisitorInfo;
}) {
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
		referer_id: cart.visitorRefererId ?? visitor?.referer_id ?? 'Unknown',

		isBot: visitor?.isBot ?? false,

		href:
			type === 'cart/purchaseMainWithoutBump' || type === 'cart/purchaseMainWithBump' ?
				cart.visitorCheckoutHref ?? visitor?.href ?? 'Unknown'
			:	visitor?.href ?? 'Unknown',
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

	const analyticsEndpoints = await dbHttp.query.AnalyticsEndpoints.findMany({
		where: eq(AnalyticsEndpoints.workspaceId, cart.workspaceId),
	});

	// ∞ Meta ∞
	const metaPixel = analyticsEndpoints.find(endpoint => endpoint.platform === 'meta');
	const metaEvents = getMetaEventsFromCartEvent({
		cart,
		funnel: cartFunnel,
		eventType: type,
	});

	const sourceUrl = visitorInfo.referer_url ?? ''; // this is an api route, so we want the source of the api call

	const fbclid =
		cookies().get(`${cartFunnel.handle}.${cartFunnel.key}.fbclid`)?.value ??
		new URL(sourceUrl).searchParams.get('fbclid');

	const metaRes =
		metaPixel?.accessToken && metaEvents ?
			await reportEventsToMeta({
				pixelId: metaPixel.id,
				accessToken: metaPixel.accessToken,
				sourceUrl,
				ip: visitorInfo.ip,
				ua: visitorInfo.userAgent.ua,
				geo: visitorInfo.geo,
				events: metaEvents,
				fbclid,
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
			referer_id: visitorInfo.referer_id,
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

function getMetaEventsFromCartEvent({
	cart,
	eventType,
}: {
	cart: Cart;
	funnel: CartFunnel;
	eventType: (typeof WEB_EVENT_TYPES__CART)[number];
}): MetaEvent[] | null {
	switch (eventType) {
		case 'cart/viewCheckout':
			return [
				{
					eventName: 'barely.cart/viewCheckout',
					customData: {
						cartId: cart.id,
						content_ids: [cart.mainProductId],
						content_type: 'product',
						currency: 'USD',
						value: cart.mainProductPrice / 100,
					},
				},
				{
					eventName: 'InitiateCheckout',
					customData: {
						cartId: cart.id,
						content_ids: [cart.mainProductId],
						content_type: 'product',
						currency: 'USD',
						value: cart.mainProductPrice / 100,
					},
				},
			];

		case 'cart/addPaymentInfo':
			return [
				{
					eventName: 'barely.cart/addPaymentInfo',
					customData: {
						cartId: cart.id,
						content_ids: [cart.mainProductId],
						content_type: 'product',
						currency: 'USD',
						value: cart.mainProductPrice / 100,
					},
				},
				{
					eventName: 'AddPaymentInfo',
					customData: {
						cartId: cart.id,
						content_ids: [cart.mainProductId],
						content_type: 'product',
						currency: 'USD',
						value: cart.mainProductPrice / 100,
					},
				},
			];
		case 'cart/addBump':
			if (!cart.bumpProductId) return null;
			return [
				{
					eventName: 'barely.cart/addBump',
					customData: {
						cartId: cart.id,
						content_ids: [cart.bumpProductId],
						content_type: 'product',
						currency: 'USD',
						value: (cart.bumpProductPrice ?? 0) / 100,
					},
				},
				{
					eventName: 'AddToCart',
					customData: {
						cartId: cart.id,
						content_ids: [cart.bumpProductId],
						content_type: 'product',
						currency: 'USD',
						value: (cart.bumpProductPrice ?? 0) / 100,
					},
				},
			];
		case 'cart/purchaseMainWithoutBump':
			return [
				{
					eventName: 'barely.cart/purchase',
					customData: {
						cartId: cart.id,
						content_ids: [cart.mainProductId],
						content_type: 'product',
						currency: 'USD',
						cartPurchaseType: 'mainWithoutBump',
						value: cart.mainProductPrice / 100,
					},
				},
				{
					eventName: 'Purchase',
					customData: {
						cartId: cart.id,
						content_ids: [cart.mainProductId],
						content_type: 'product',
						currency: 'USD',
						value: cart.mainProductPrice / 100,
					},
				},
			];
		case 'cart/purchaseMainWithBump':
			if (!cart.bumpProductId) return null;
			return [
				{
					eventName: 'barely.cart/purchase',
					customData: {
						cartId: cart.id,
						content_ids: [cart.mainProductId, cart.bumpProductId],
						content_type: 'product',
						currency: 'USD',
						cartPurchaseType: 'mainWithBump',
						value: (cart.mainProductPrice + (cart.bumpProductPrice ?? 0)) / 100,
					},
				},
				{
					eventName: 'Purchase',
					customData: {
						cartId: cart.id,
						content_ids: [cart.mainProductId, cart.bumpProductId],
						content_type: 'product',
						currency: 'USD',
						value: (cart.mainProductPrice + (cart.bumpProductPrice ?? 0)) / 100,
					},
				},
			];
		case 'cart/viewUpsell':
			if (!cart.upsellProductId) return null;
			return [
				{
					eventName: 'barely.cart/viewUpsell',
					customData: {
						cartId: cart.id,
						content_ids: [cart.upsellProductId],
						content_type: 'product',
					},
				},
				{
					eventName: 'ViewContent',
					customData: {
						cartId: cart.id,
						content_ids: [cart.upsellProductId],
						content_type: 'product',
					},
				},
			];
		case 'cart/purchaseUpsell':
			if (!cart.upsellProductId) return null;
			return [
				{
					eventName: 'barely.cart/purchase',
					customData: {
						cartId: cart.id,
						upsellProductId: cart.upsellProductId,
						content_ids: [cart.upsellProductId],
						content_type: 'product',
						currency: 'USD',
						cartPurchaseType: 'upsell',
						value: (cart.upsellProductPrice ?? 0) / 100,
					},
				},
				{
					eventName: 'Purchase',
					customData: {
						cartId: cart.id,
						content_ids: [cart.upsellProductId],
						content_type: 'product',
						currency: 'USD',
						value: (cart.upsellProductPrice ?? 0) / 100,
					},
				},
			];
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
		case 'cart/viewCheckout':
			return {
				cart_checkout_mainProductId: cart.mainProductId,
				cart_checkout_mainProductPrice: cart.mainProductPrice,
				cart_checkout_mainProductPayWhatYouWant: cart.mainProductPayWhatYouWant,
				cart_checkout_bumpProductId: cart.bumpProductId,
				cart_checkout_bumpProductPrice: cart.bumpProductPrice,
			};

		case 'cart/addPaymentInfo':
			return {
				cart_checkout_mainProductId: cart.mainProductId,
				cart_checkout_mainProductPrice: cart.mainProductPrice,
				cart_checkout_mainProductPayWhatYouWant: cart.mainProductPayWhatYouWant,
				cart_checkout_bumpProductId: cart.bumpProductId,
				cart_checkout_bumpProductPrice: cart.bumpProductPrice,
			};

		case 'cart/addBump':
			return {
				cart_checkout_mainProductId: cart.mainProductId,
				cart_checkout_mainProductPrice: cart.mainProductPrice,
				cart_checkout_mainProductPayWhatYouWant: cart.mainProductPayWhatYouWant,
				cart_checkout_bumpProductId: cart.bumpProductId,
				cart_checkout_bumpProductPrice: cart.bumpProductPrice,
			};

		case 'cart/removeBump':
			return {
				cart_checkout_mainProductId: cart.mainProductId,
				cart_checkout_mainProductPrice: cart.mainProductPrice,
				cart_checkout_mainProductPayWhatYouWant: cart.mainProductPayWhatYouWant,
				cart_checkout_bumpProductId: cart.bumpProductId,
				cart_checkout_bumpProductPrice: cart.bumpProductPrice,
			};

		case 'cart/purchaseMainWithoutBump':
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
		case 'cart/purchaseMainWithBump':
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

		case 'cart/viewUpsell':
			return {
				cart_upsell_upsellProductId: cart.upsellProductId,
			};

		case 'cart/declineUpsell':
			return {
				// maybe insight into why upsell was declined
				cart_checkoutPurchase_amount: cart.checkoutAmount,

				cart_upsell_upsellProductId: cart.upsellProductId,
			};

		case 'cart/purchaseUpsell':
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

		case 'cart/viewOrderConfirmation':
			return {};

		default:
			return {};
	}
}

/* FM */

export async function recordFmEvent({
	fmPage,
	fmLink,
	type,
	visitor,
}: {
	fmPage: FmPage;
	type: (typeof WEB_EVENT_TYPES__FM)[number];
	fmLink?: FmLink;
	visitor?: VisitorInfo;
}) {
	console.log('visitor >>', visitor);

	if (visitor?.isBot) return null;

	// const rateLimitPeriod = env.RATE_LIMIT_RECORD_FM_EVENT ?? '1 h';
	const rateLimitPeriod = '1 s';

	const { success } = await ratelimit(10, rateLimitPeriod).limit(
		`recordFmEvent:${visitor?.ip}:${fmPage.id}:${type}:${fmLink?.platform}`,
	);

	if (!success) {
		console.log(
			'rate limit exceeded for ',
			visitor?.ip,
			fmPage.id,
			type,
			fmLink?.platform,
		);
		return null;
	}

	const timestamp = new Date(Date.now()).toISOString();

	const analyticsEndpoints = await dbHttp.query.AnalyticsEndpoints.findMany({
		where: eq(AnalyticsEndpoints.workspaceId, fmPage.workspaceId),
	});

	const metaPixel = analyticsEndpoints.find(endpoint => endpoint.platform === 'meta');
	const metaEvents = getMetaEventFromFmEvent({
		fmPage,
		fmLink,
		eventType: type,
	});

	const sourceUrl = isDevelopment() ? visitor?.href ?? '' : visitor?.referer_url ?? ''; // this is being logged from an api route in preview/production, so we want the referer_url

	const fbclid = new URL(sourceUrl).searchParams.get('fbclid');

	const metaRes =
		metaPixel?.accessToken && metaEvents ?
			await reportEventsToMeta({
				pixelId: metaPixel.id,
				accessToken: metaPixel.accessToken,
				sourceUrl,
				ip: visitor?.ip,
				ua: visitor?.userAgent.ua,
				geo: visitor?.geo,
				events: metaEvents,
				fbclid,
			}).catch(err => {
				console.log('error => ', err);
				return { reported: false };
			})
		:	{ reported: false };

	// report event to tinybird
	try {
		const tinybirdRes = await ingestFmEvent({
			timestamp,
			workspaceId: fmPage.workspaceId,
			assetId: fmPage.id,
			sessionId: newId('fmSession'),
			type,
			...visitor,
			href: sourceUrl,
			linkClickDestinationHref: fmLink?.url,
			reportedToMeta: metaPixel && metaRes.reported ? metaPixel.id : 'false',
		});

		console.log('tinybirdRes for fm event => ', tinybirdRes);
	} catch (error) {
		console.log('error => ', error);
		throw new Error('ah!');
	}

	if (type === 'fm/view') {
		// increment fmPage views
		await dbHttp
			.update(FmPages)
			.set({ views: sqlIncrement(FmPages.views) })
			.where(eq(FmPages.id, fmPage.id));
	} else if (type === 'fm/linkClick' && fmLink) {
		// increment fmLinkClicks

		const platformClickIncrement = {
			...(fmLink.platform === 'amazonMusic' ?
				{ amazonMusicClicks: sqlIncrement(FmPages.amazonMusicClicks) }
			:	{}),
			...(fmLink.platform === 'appleMusic' ?
				{ appleMusicClicks: sqlIncrement(FmPages.appleMusicClicks) }
			:	{}),
			...(fmLink.platform === 'deezer' ?
				{ deezerClicks: sqlIncrement(FmPages.deezerClicks) }
			:	{}),
			...(fmLink.platform === 'itunes' ?
				{ itunesClicks: sqlIncrement(FmPages.itunesClicks) }
			:	{}),
			...(fmLink.platform === 'spotify' ?
				{ spotifyClicks: sqlIncrement(FmPages.spotifyClicks) }
			:	{}),
			...(fmLink.platform === 'tidal' ?
				{ tidalClicks: sqlIncrement(FmPages.tidalClicks) }
			:	{}),
			...(fmLink.platform === 'tiktok' ?
				{ tiktokClicks: sqlIncrement(FmPages.tiktokClicks) }
			:	{}),
			...(fmLink.platform === 'youtube' ?
				{ youtubeClicks: sqlIncrement(FmPages.youtubeClicks) }
			:	{}),
			...(fmLink.platform === 'youtubeMusic' ?
				{ youtubeMusicClicks: sqlIncrement(FmPages.youtubeMusicClicks) }
			:	{}),
		};

		await dbHttp
			.update(FmLinks)
			.set({ clicks: sqlIncrement(FmLinks.clicks) })
			.where(eq(FmLinks.id, fmLink.id));
		await dbHttp
			.update(FmPages)
			.set({ clicks: sqlIncrement(FmPages.clicks), ...platformClickIncrement })
			.where(eq(FmPages.id, fmPage.id));
	}
}

function getMetaEventFromFmEvent({
	fmPage,
	fmLink,
	eventType,
}: {
	fmPage: FmPage;
	fmLink?: FmLink;
	eventType: (typeof WEB_EVENT_TYPES__FM)[number];
}): MetaEvent[] | null {
	switch (eventType) {
		case 'fm/view':
			return [
				{
					eventName: 'barely.fm/view',
					customData: {
						fmId: fmPage.id,
					},
				},
				{
					eventName: 'ViewContent',
					customData: {
						fmId: fmPage.id,
					},
				},
			];
		case 'fm/linkClick':
			return [
				{
					eventName: 'barely.fm/linkClick',
					customData: {
						fmId: fmPage.id,
						platform: fmLink?.platform,
					},
				},
			];
		default:
			return null;
	}
}

/* PAGE */
export async function recordLandingPageEvent({
	page,
	type,
	visitor,
	linkClickDestinationAssetId,
	linkClickDestinationHref,
}: {
	page: LandingPage;
	type: (typeof WEB_EVENT_TYPES__PAGE)[number];
	visitor?: VisitorInfo;
	linkClickDestinationAssetId?: string;
	linkClickDestinationHref?: string;
}) {
	if (visitor?.isBot) return null;

	const rateLimitPeriod = '1 s';

	const { success } = await ratelimit(10, rateLimitPeriod).limit(
		`recordLandingPageEvent:${visitor?.ip}:${page.id}:${type}:${linkClickDestinationAssetId}`,
	);

	if (!success) {
		console.log(
			'rate limit exceeded for ',
			visitor?.ip,
			page.id,
			type,
			linkClickDestinationAssetId,
		);
		return null;
	}

	const timestamp = new Date(Date.now()).toISOString();

	const analyticsEndpoints = await dbHttp.query.AnalyticsEndpoints.findMany({
		where: eq(AnalyticsEndpoints.workspaceId, page.workspaceId),
	});

	const metaPixel = analyticsEndpoints.find(endpoint => endpoint.platform === 'meta');
	const metaEvents = getMetaEventFromPageEvent({
		page,
		linkClickDestinationHref,
		linkClickDestinationAssetId,
		eventType: type,
	});

	const sourceUrl = isDevelopment() ? visitor?.href ?? '' : visitor?.referer_url ?? ''; // this is being logged from an api route, so we want the referer_url (i.e. the client url calling the logged route)
	const fbclid = new URL(sourceUrl).searchParams.get('fbclid');

	const metaRes =
		metaPixel?.accessToken && metaEvents ?
			await reportEventsToMeta({
				pixelId: metaPixel.id,
				accessToken: metaPixel.accessToken,
				sourceUrl,
				ip: visitor?.ip,
				ua: visitor?.userAgent.ua,
				geo: visitor?.geo,
				events: metaEvents,
				fbclid,
			})
		:	{ reported: false };

	// report event to tinybird
	try {
		const tinybirdRes = await ingestPageEvent({
			timestamp,
			workspaceId: page.workspaceId,
			assetId: page.id,
			sessionId: newId('landingPageSession'),
			type,
			...visitor,
			href: sourceUrl,
			linkClickDestinationAssetId,
			linkClickDestinationHref,
			reportedToMeta: metaPixel && metaRes.reported ? metaPixel.id : 'false',
		});

		console.log('tinybirdRes for page event => ', tinybirdRes);
	} catch (error) {
		console.log('error >>', error);
		throw new Error('ah!');
	}

	/* increment stats on landingPage */
	if (type === 'page/view') {
		// increment page views
		await dbHttp
			.update(LandingPages)
			.set({ views: sqlIncrement(LandingPages.views) })
			.where(eq(LandingPages.id, page.id));
	} else if (type === 'page/linkClick') {
		// increment page clicks
		await dbHttp
			.update(LandingPages)
			.set({ clicks: sqlIncrement(LandingPages.clicks) })
			.where(eq(LandingPages.id, page.id));
	}
}

function getMetaEventFromPageEvent({
	page,
	eventType,
	linkClickDestinationHref,
	linkClickDestinationAssetId,
}: {
	page: LandingPage;
	linkClickDestinationHref?: string;
	linkClickDestinationAssetId?: string;
	eventType: (typeof WEB_EVENT_TYPES__PAGE)[number];
}): MetaEvent[] | null {
	switch (eventType) {
		case 'page/view':
			return [
				{
					eventName: 'barely.page/view',
					customData: {
						pageId: page.id,
					},
				},
				{
					eventName: 'ViewContent',
					customData: {
						content_ids: [page.id],
					},
				},
			];
		case 'page/linkClick':
			return [
				{
					eventName: 'barely.page/linkClick',
					customData: {
						pageId: page.id,
						linkClickDestinationAssetId,
						linkClickDestinationHref,
					},
				},
			];
		default:
			return null;
	}
}
