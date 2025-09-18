import type {
	FM_LINK_PLATFORMS,
	WEB_EVENT_TYPES__CART,
	WEB_EVENT_TYPES__FM,
	WEB_EVENT_TYPES__LINK,
	WEB_EVENT_TYPES__PAGE,
} from '@barely/const';
import type { cartEventIngestSchema } from '@barely/tb/schema';
import type {
	Cart,
	CartFunnel,
	FmLink,
	FmPage,
	LandingPage,
	LinkAnalyticsProps,
	VipSwap,
	Workspace,
} from '@barely/validators/schemas';
import type { z } from 'zod/v4';
import { cookies } from 'next/headers';
import { WEB_EVENT_TYPES__VIP, WORKSPACE_PLANS } from '@barely/const';
import { dbHttp } from '@barely/db/client';
import { AnalyticsEndpoints } from '@barely/db/sql/analytics-endpoint.sql';
import { FmLinks, FmPages } from '@barely/db/sql/fm.sql';
import { LandingPages } from '@barely/db/sql/landing-page.sql';
import { Links } from '@barely/db/sql/link.sql';
import { VipSwaps } from '@barely/db/sql/vip-swap.sql';
import { Workspaces } from '@barely/db/sql/workspace.sql';
import { sqlIncrement } from '@barely/db/utils';
import {
	ingestCartEvent,
	ingestFmEvent,
	ingestPageEvent,
	ingestVipEvent,
	ingestWebEvent,
} from '@barely/tb/ingest';
import { fmEventIngestSchema, webEventIngestSchema } from '@barely/tb/schema';
import {
	formatMinorToMajorCurrency,
	getFirstAndLastName,
	isDevelopment,
	newId,
} from '@barely/utils';
import { eq } from 'drizzle-orm';

import type { MetaEvent } from '../integrations/meta/meta.endpts.event';
import type { VisitorInfo } from '../middleware/request-parsing';
import { libEnv } from '../../env';
import { reportEventsToMeta } from '../integrations/meta/meta.endpts.event';
import { ratelimit } from '../integrations/upstash';
import { log } from '../utils/log';

/**
 * Flattens visitor info (specifically geo and userAgent)
 * for ingestion into tinybird
 */
export const flattenVisitorForIngest = (visitor?: VisitorInfo) => {
	if (!visitor) return {};
	const { geo, userAgent, ...rest } = visitor;
	return {
		...rest,
		...geo,
		...userAgent,
	};
};

export interface RecordClickProps {
	link: LinkAnalyticsProps;
	type: (typeof WEB_EVENT_TYPES__LINK)[number];
	href: string;
	platform?: (typeof FM_LINK_PLATFORMS)[number];
	visitor?: VisitorInfo;
	workspace: Pick<Workspace, 'id' | 'plan' | 'eventUsage' | 'eventUsageLimitOverride'>;
}

export async function recordLinkClick({
	link,
	href,
	type,
	platform,
	visitor,
	workspace,
}: RecordClickProps) {
	if (visitor?.isBot) return null;

	// deduplicate clicks from the same ip & linkId - only record 1 link click per ip per linkId per hour
	const rateLimitPeriod = libEnv.RATE_LIMIT_RECORD_LINK_CLICK;

	const { success } = await ratelimit(1, rateLimitPeriod).limit(
		`recordClick:${visitor?.ip}:${link.id}`,
	);

	if (!success) return null;

	// check if the workspace is above the event usage limit.
	const isAboveEventUsageLimit = await checkIfWorkspaceIsAboveEventUsageLimit({
		workspace,
	});

	if (isAboveEventUsageLimit) {
		await log({
			type: 'alerts',
			location: 'recordLinkClick',
			message: `workspace ${link.workspaceId} is above the event usage limit`,
		});

		return;
	}

	const time = Date.now();
	const timestamp = new Date(time).toISOString();

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

	// await log({
	// 	type: 'link',
	// 	location: 'recordLinkClick',
	// 	message: `metaPixel => ${metaPixel?.id}`,
	// });

	const fbclid = new URL(href).searchParams.get('fbclid');
	const sourceUrl = href; // this is being logged directly from middleware, so href is the sourceUrl

	const metaRes =
		metaPixel?.accessToken ?
			await reportEventsToMeta({
				pixelId: metaPixel.id,
				accessToken: metaPixel.accessToken,
				sourceUrl,
				fbclid,
				ip: visitor?.ip,
				ua: visitor?.userAgent.ua,
				geo: visitor?.geo,
				events: [
					{
						eventName: 'barely.link/click',
						customData: {
							platform,
						},
					},
					{
						eventName: 'ViewContent',
						customData: {
							content_type: 'barely.link/click',
							linkId: link.id,
						},
					},
				],
			}).catch(async err => {
				await log({
					type: 'errors',
					location: 'recordLinkClick',
					message: `err reporting link click to meta => ${err}`,
				});
				return { reported: false };
			})
		:	{ reported: false };

	// report event to tinybird
	try {
		const eventData = webEventIngestSchema.parse({
			timestamp,
			workspaceId: link.workspaceId,
			assetId: link.id,
			href,
			type,
			domain: link.domain,
			key: link.key,
			// analytics
			...flattenVisitorForIngest(visitor),
			sessionId: visitor?.sessionId ?? newId('linkClick'),
			platform,
			reportedToMeta: metaPixel && metaRes.reported ? metaPixel.id : undefined,
		});

		const tinybirdRes = await ingestWebEvent(eventData);

		console.log('tinybirdRes => ', tinybirdRes);
	} catch (error) {
		await log({
			type: 'errors',
			location: 'recordLinkClick',
			message: `error ingesting link click => ${String(error)}`,
		});
	}

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

	// increment the workspace event usage count in db
	await dbHttp
		.update(Workspaces)
		.set({ eventUsage: sqlIncrement(Workspaces.eventUsage) })
		.where(eq(Workspaces.id, link.workspaceId));

	return;
}

async function checkIfWorkspaceIsAboveEventUsageLimit({
	workspace,
}: {
	workspace: Pick<Workspace, 'id' | 'plan' | 'eventUsage' | 'eventUsageLimitOverride'>;
}) {
	const eventUsageLimit =
		workspace.eventUsageLimitOverride ??
		WORKSPACE_PLANS.get(workspace.plan)?.usageLimits.trackedEventsPerMonth;

	if (!eventUsageLimit) {
		await log({
			type: 'alerts',
			location: 'checkIfWorkspaceIsAboveEventUsageLimit',
			message: `no event usage limit found for workspace ${workspace.id}`,
		});
		return false;
	}

	if (workspace.eventUsage >= eventUsageLimit) {
		return true;
	}

	return false;
}

/* CART */

export async function recordCartEvent({
	cart,
	cartFunnel,
	type,
	visitor,
	currency,
}: {
	cart: Cart;
	cartFunnel: CartFunnel;
	type: (typeof WEB_EVENT_TYPES__CART)[number];
	currency: 'usd' | 'gbp';
	visitor?: VisitorInfo;
}) {
	const visitorInfo: VisitorInfo = {
		...visitor,
		ip: cart.visitorIp ?? visitor?.ip ?? 'Unknown',
		geo: {
			country: cart.visitorGeo?.country ?? visitor?.geo.country ?? 'Unknown',
			region: cart.visitorGeo?.region ?? visitor?.geo.region ?? 'Unknown',
			city: cart.visitorGeo?.city ?? visitor?.geo.city ?? 'Unknown',
			zip: cart.shippingAddressPostalCode ?? visitor?.geo.zip ?? 'Unknown',
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
		fbclid: cart.fbclid ?? visitor?.fbclid ?? null,
		sessionId: cart.id,
		sessionMetaCampaignId:
			cart.sessionMetaCampaignId ?? visitor?.sessionMetaCampaignId ?? null,
		sessionMetaAdsetId: cart.sessionMetaAdsetId ?? visitor?.sessionMetaAdsetId ?? null,
		sessionMetaAdId: cart.sessionMetaAdId ?? visitor?.sessionMetaAdId ?? null,
		sessionMetaPlacement:
			cart.sessionMetaPlacement ?? visitor?.sessionMetaPlacement ?? null,
		sessionRefererId: cart.visitorRefererId ?? visitor?.sessionRefererId ?? 'Unknown',
		sessionReferer: cart.sessionReferer ?? visitor?.sessionReferer ?? 'Unknown',
		sessionRefererUrl: cart.sessionRefererUrl ?? visitor?.sessionRefererUrl ?? 'Unknown',
		sessionEmailBroadcastId:
			cart.emailBroadcastId ?? visitor?.sessionEmailBroadcastId ?? null,
		sessionEmailTemplateId:
			cart.emailTemplateId ?? visitor?.sessionEmailTemplateId ?? null,
		fanId: cart.fanId ?? visitor?.fanId ?? null,
		sessionFlowActionId: cart.flowActionId ?? visitor?.sessionFlowActionId ?? null,
		sessionLandingPageId: cart.landingPageId ?? visitor?.sessionLandingPageId ?? null,

		// Journey tracking fields
		journeyId: visitor?.journeyId ?? cart.id,
		journeyOrigin: visitor?.journeyOrigin ?? null,
		journeySource: visitor?.journeySource ?? null,
		journeyStep: visitor?.journeyStep ?? '1',
		journeyPath: visitor?.journeyPath ?? [],
		referrerId: visitor?.referrerId ?? null,
		originalReferrerId: visitor?.originalReferrerId ?? null,

		isBot: visitor?.isBot ?? false,

		href:
			type === 'cart/purchaseMainWithoutBump' || type === 'cart/purchaseMainWithBump' ?
				(cart.visitorCheckoutHref ?? visitor?.href ?? 'Unknown')
			:	(visitor?.href ?? 'Unknown'),
	};

	if (visitorInfo.isBot) return null;

	// todo: check if the workspace is above the event usage limit. for now, we're letting all cart events get reported

	// deduplication events from the same ip & cartId - only record 1 cart event per ip per cartId per hour
	const rateLimitPeriod = libEnv.RATE_LIMIT_RECORD_CART_EVENT;

	const { success } = await ratelimit(1, rateLimitPeriod).limit(
		`recordCartEvent:${visitorInfo.ip}:${cart.id}:${type}`,
	);

	if (!success) {
		console.log('log rate limit exceeded for ', visitorInfo.ip, cart.id, type);
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
	const cookieStore = await cookies();
	const fbclid =
		cart.fbclid ??
		cookieStore.get(`${cartFunnel.handle}.${cartFunnel.key}.fbclid`)?.value ??
		new URL(sourceUrl).searchParams.get('fbclid');

	const email = cart.emailMarketingOptIn && cart.email ? cart.email : undefined;
	const phone = cart.smsMarketingOptIn && cart.phone ? cart.phone : undefined;

	const { firstName, lastName } = getFirstAndLastName({
		fullName: cart.fullName,
		firstName: cart.firstName,
		lastName: cart.lastName,
	});

	const metaRes =
		metaPixel?.accessToken && metaEvents ?
			await reportEventsToMeta({
				pixelId: metaPixel.id,
				accessToken: metaPixel.accessToken,
				sourceUrl,
				email,
				phone,
				firstName,
				lastName,
				ip: visitorInfo.ip,
				ua: visitorInfo.userAgent.ua,
				geo: visitorInfo.geo,
				events: metaEvents,
				fbclid,
			}).catch(async err => {
				await log({
					type: 'errors',
					location: 'recordCartEvent',
					message: `err reporting cart event to meta => ${err}`,
				});
				return { reported: false };
			})
		:	{ reported: false };

	// ♪ TikTok ♪

	// 🐦 report event to tinybird with journey tracking
	try {
		const cartEventData = getCartEventData({ cart, eventType: type });

		// Extract journey info - preserve journey from visitor or use cart session
		const journeyId = visitor?.journeyId ?? cart.id;
		const journeyOrigin = visitor?.journeyOrigin ?? journeyId.split('_')[0] ?? 'cart';
		const journeySource = visitor?.journeySource ?? 'unknown';
		const journeyStep = visitor?.journeyStep ?? '1';

		const tinybirdRes = await ingestCartEvent({
			timestamp,
			workspaceId: cart.workspaceId,
			assetId: cartFunnel.id,
			sessionId: journeyId, // Use journey ID as primary session
			href: visitorInfo.href,
			type,
			key: cartFunnel.key,
			// analytics
			...flattenVisitorForIngest(visitorInfo),
			reportedToMeta: metaPixel && metaRes.reported ? metaPixel.id : '',
			...cartEventData,
			// Journey tracking (if supported by schema)
			journeyId,
			journeyOrigin,
			journeySource,
			journeyStep: parseInt(journeyStep),
			// Cart-specific session for backward compatibility
			cartSessionId: cart.id,
		});

		if (tinybirdRes.quarantined_rows) {
			await log({
				type: 'errors',
				location: 'recordCartEvent',
				message: `quarantined_rows => ${tinybirdRes.quarantined_rows}`,
			});
		}
	} catch (error) {
		await log({
			type: 'errors',
			location: 'recordCartEvent',
			message: `error ingesting cart event '${type}' => ${String(error)}`,
		});
	}

	// report sales to slack
	if (type === 'cart/purchaseMainWithoutBump' || type === 'cart/purchaseMainWithBump') {
		await log({
			type: 'sales',
			location: 'recordCartEvent',
			message: `${cartFunnel.handle} checkout [${cart.id}] :: ${formatMinorToMajorCurrency(cart.checkoutAmount, currency)}`,
		});
	}

	if (type === 'cart/purchaseUpsell') {
		await log({
			type: 'sales',
			location: 'recordCartEvent',
			message: `${cartFunnel.handle} upsell [${cart.id}] :: ${formatMinorToMajorCurrency(cart.upsellProductAmount ?? 0, currency)}`,
		});
	}

	// increment the workspace event usage count in db
	await dbHttp
		.update(Workspaces)
		.set({ eventUsage: sqlIncrement(Workspaces.eventUsage) })
		.where(eq(Workspaces.id, cart.workspaceId));
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
		case 'cart/viewOrderConfirmation':
			return null;
		case 'cart/updateMainProductPayWhatYouWantPrice':
			return null;
		case 'cart/addEmail':
			return null;
		case 'cart/addShippingInfo':
			return null;
		case 'cart/removeBump':
			return null;
		case 'cart/checkoutPurchase':
			return null;
		case 'cart/declineUpsell':
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

		case 'cart/updateMainProductPayWhatYouWantPrice':
			return {};
		case 'cart/addEmail':
			return {};
		case 'cart/addShippingInfo':
			return {};
		case 'cart/checkoutPurchase':
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
	workspace,
}: {
	fmPage: FmPage;
	type: (typeof WEB_EVENT_TYPES__FM)[number];
	fmLink?: FmLink;
	visitor?: VisitorInfo;
	workspace: Pick<Workspace, 'id' | 'plan' | 'eventUsage' | 'eventUsageLimitOverride'>;
}) {
	console.log('recordFmEvent visitor >>', visitor);

	if (visitor?.isBot) return null;

	const rateLimitPeriod = isDevelopment() ? '1 s' : '1 h';

	const { success } = await ratelimit(1, rateLimitPeriod).limit(
		`recordFmEvent:${visitor?.ip}:${fmPage.id}:${type}:${fmLink?.platform}`,
	);

	if (!success) {
		await log({
			type: 'alerts',
			location: 'recordFmEvent',
			message: `rate limit exceeded for ${visitor?.ip} ${fmPage.id} ${type} ${fmLink?.platform}`,
		});
		return null;
	}

	// check if the workspace is above the event usage limit.
	const isAboveEventUsageLimit = await checkIfWorkspaceIsAboveEventUsageLimit({
		workspace,
	});

	if (isAboveEventUsageLimit) {
		await log({
			type: 'alerts',
			location: 'recordFmEvent',
			message: `workspace ${fmPage.workspaceId} is above the event usage limit`,
		});
		return;
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

	// this is being logged from an api route in preview/production, so the sourceUrl is the referer_url
	const sourceUrl = (isDevelopment() ? visitor?.href : visitor?.referer_url) ?? '';

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
				fbclid: visitor?.fbclid ?? null,
			}).catch(async err => {
				await log({
					type: 'errors',
					location: 'recordFmEvent',
					message: `err reporting link click to meta => ${err}`,
				});
				return { reported: false };
			})
		:	{ reported: false };

	// report event to tb

	try {
		// Extract journey info from visitor with proper defaults for FM events
		const journeyId = visitor?.journeyId ?? visitor?.sessionId ?? newId('barelySession');
		const journeyOrigin = visitor?.journeyOrigin ?? journeyId.split('_')[0] ?? 'fm';
		const journeySource = visitor?.journeySource ?? `fm:${fmPage.handle}:${fmPage.key}`;
		const journeyStep = visitor?.journeyStep ? parseInt(visitor.journeyStep, 10) : 1;
		const journeyPath = visitor?.journeyPath ?? [`fm:${fmPage.handle}:${fmPage.key}`];

		const eventData = webEventIngestSchema.extend(fmEventIngestSchema.shape).parse({
			timestamp,
			workspaceId: fmPage.workspaceId,
			assetId: fmPage.id,
			...flattenVisitorForIngest(visitor),
			sessionId: journeyId,
			type,
			href: sourceUrl,
			linkClickDestinationHref: fmLink?.url ?? null,
			platform: fmLink?.platform ?? '',
			reportedToMeta: metaPixel && metaRes.reported ? metaPixel.id : undefined,
			// Journey tracking fields with proper defaults
			journeyId,
			journeyOrigin,
			journeySource,
			journeyStep,
			journeyPath,
		});

		console.log('fmeventData => ', eventData);
		const fmEventRes = await ingestFmEvent({
			timestamp,
			type,
			workspaceId: fmPage.workspaceId,
			assetId: fmPage.id,
			sessionId: journeyId,
			...flattenVisitorForIngest(visitor),
			href: sourceUrl,
			linkClickDestinationHref: fmLink?.url ?? '',
			fmLinkPlatform: fmLink?.platform ?? '',
			reportedToMeta: metaPixel && metaRes.reported ? metaPixel.id : '',
			// Journey tracking fields with proper defaults
			journeyId,
			journeyOrigin,
			journeySource,
			journeyStep,
			journeyPath,
		});

		console.log('fmEventRes => ', fmEventRes);
	} catch (error) {
		await log({
			type: 'errors',
			location: 'recordFmEvent',
			message: `error ingesting fm event => ${String(error)}`,
		});
	}

	if (type === 'fm/view') {
		// increment fmPage views
		await dbHttp
			.update(FmPages)
			.set({ views: sqlIncrement(FmPages.views) })
			.where(eq(FmPages.id, fmPage.id));
	} else if (fmLink) {
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

	// increment the workspace event usage count in db
	await dbHttp
		.update(Workspaces)
		.set({ eventUsage: sqlIncrement(Workspaces.eventUsage) })
		.where(eq(Workspaces.id, fmPage.workspaceId));
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
				{
					eventName: 'ViewContent',
					customData: {
						content_type: 'barely.fm/linkClick',
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
export async function recordPageEvent({
	page,
	type,
	visitor,
	linkClickDestinationAssetId,
	linkClickDestinationHref,
	workspace,
}: {
	page: LandingPage;
	type: (typeof WEB_EVENT_TYPES__PAGE)[number];
	visitor?: VisitorInfo;
	linkClickDestinationAssetId?: string;
	linkClickDestinationHref?: string;
	workspace: Pick<Workspace, 'id' | 'plan' | 'eventUsage' | 'eventUsageLimitOverride'>;
}) {
	if (visitor?.isBot) return null;

	const rateLimitPeriod = isDevelopment() ? '1 s' : '1 h';

	const { success } = await ratelimit(1, rateLimitPeriod).limit(
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

	const isAboveEventUsageLimit = await checkIfWorkspaceIsAboveEventUsageLimit({
		workspace,
	});

	if (isAboveEventUsageLimit) {
		await log({
			type: 'alerts',
			location: 'recordLandingPageEvent',
			message: `workspace ${page.workspaceId} is above the event usage limit`,
		});
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

	const sourceUrl =
		isDevelopment() ? (visitor?.href ?? '') : (visitor?.referer_url ?? ''); // this is being logged from an api route, so we want the referer_url (i.e. the client url calling the logged route)

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
				fbclid: visitor?.fbclid ?? null,
			})
		:	{ reported: false };

	// report event to tinybird
	try {
		await ingestPageEvent({
			timestamp,
			type,
			workspaceId: page.workspaceId,
			assetId: page.id,
			sessionId: visitor?.sessionId ?? newId('landingPageSession'),
			...flattenVisitorForIngest(visitor),
			href: sourceUrl,
			linkClickDestinationAssetId: linkClickDestinationAssetId ?? '',
			linkClickDestinationHref: linkClickDestinationHref ?? '',
			reportedToMeta: metaPixel && metaRes.reported ? metaPixel.id : '',
		});

		// console.log('tinybirdRes for page event => ', tinybirdRes);
	} catch (error) {
		console.log('error >>', error);
		throw new Error('ah!');
	}

	/* increment stats on landingPage */
	switch (type) {
		case 'page/view':
			// increment page views
			await dbHttp
				.update(LandingPages)
				.set({ views: sqlIncrement(LandingPages.views) })
				.where(eq(LandingPages.id, page.id));
			break;
		case 'page/linkClick':
			// increment page clicks
			await dbHttp
				.update(LandingPages)
				.set({ clicks: sqlIncrement(LandingPages.clicks) })
				.where(eq(LandingPages.id, page.id));
			break;
	}

	// increment the workspace event usage count in db
	await dbHttp
		.update(Workspaces)
		.set({ eventUsage: sqlIncrement(Workspaces.eventUsage) })
		.where(eq(Workspaces.id, page.workspaceId));
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
						content_type: 'barely.page/view',
						pageId: page.id,
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
				{
					eventName: 'ViewContent',
					customData: {
						content_type: 'barely.page/linkClick',
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

/* VIP */

export async function recordVipEvent({
	vipSwap,
	type,
	visitor,
	workspace,
	emailCaptured,
	downloadToken,
	email: _email,
	fanId: _fanId,
}: {
	vipSwap: VipSwap;
	type: (typeof WEB_EVENT_TYPES__VIP)[number];
	visitor?: VisitorInfo;
	workspace: Pick<Workspace, 'id' | 'plan' | 'eventUsage' | 'eventUsageLimitOverride'>;
	emailCaptured?: string;
	downloadToken?: string;
	email?: string;
	fanId?: string | null;
}) {
	if (visitor?.isBot) return null;

	// Validate required fields
	if (!vipSwap.id || !vipSwap.workspaceId) {
		await log({
			type: 'errors',
			location: 'recordVipEvent',
			message: 'Missing required vipSwap fields',
		});
		return null;
	}

	if (!WEB_EVENT_TYPES__VIP.includes(type)) {
		await log({
			type: 'errors',
			location: 'recordVipEvent',
			message: `Invalid event type: ${type}`,
		});
		return null;
	}

	// Validate email format if provided
	if (emailCaptured && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailCaptured)) {
		await log({
			type: 'errors',
			location: 'recordVipEvent',
			message: 'Invalid email format for emailCaptured',
		});
		return null;
	}

	// Validate download token format if provided
	if (downloadToken && downloadToken.length < 20) {
		await log({
			type: 'errors',
			location: 'recordVipEvent',
			message: 'Invalid download token format',
		});
		return null;
	}

	// Use sessionId for rate limiting when available, fallback to IP
	const rateLimitKey = visitor?.sessionId ?? visitor?.ip ?? 'unknown';

	// Apply rate limiting based on event type
	if (type === 'vip/view') {
		// Allow 1 view per session per swap per hour
		const { success } = await ratelimit(1, isDevelopment() ? '1 s' : '1 h').limit(
			`recordVipEvent:${type}:${rateLimitKey}:${vipSwap.id}`,
		);
		if (!success) {
			await log({
				type: 'alerts',
				location: 'recordVipEvent',
				message: `rate limit exceeded for ${rateLimitKey} ${vipSwap.id} ${type}`,
			});
			return null;
		}
	} else if (type === 'vip/emailCapture') {
		// Allow 1 email capture per session per swap (24 hours to prevent abuse)
		const { success } = await ratelimit(1, isDevelopment() ? '1 s' : '24 h').limit(
			`recordVipEvent:${type}:${rateLimitKey}:${vipSwap.id}`,
		);
		if (!success) {
			await log({
				type: 'alerts',
				location: 'recordVipEvent',
				message: `rate limit exceeded for ${rateLimitKey} ${vipSwap.id} ${type}`,
			});
			return null;
		}
	} else {
		// type === 'vip/download'
		// For downloads, don't apply additional rate limiting here
		// The download limit is already enforced in the getDownloadUrl procedure
		// based on vipSwap.downloadLimit setting
		// We just want to prevent rapid-fire duplicate events from the same session
		const { success } = await ratelimit(1, isDevelopment() ? '1 s' : '10 s').limit(
			`recordVipEvent:${type}:${rateLimitKey}:${vipSwap.id}`,
		);
		if (!success) {
			// This is likely a duplicate click, silently ignore
			return null;
		}
	}

	// check if the workspace is above the event usage limit.
	const isAboveEventUsageLimit = await checkIfWorkspaceIsAboveEventUsageLimit({
		workspace,
	});

	if (isAboveEventUsageLimit) {
		await log({
			type: 'alerts',
			location: 'recordVipEvent',
			message: `workspace ${vipSwap.workspaceId} is above the event usage limit`,
		});
		return;
	}

	const timestamp = new Date(Date.now()).toISOString();

	const analyticsEndpoints = await dbHttp.query.AnalyticsEndpoints.findMany({
		where: eq(AnalyticsEndpoints.workspaceId, vipSwap.workspaceId),
	});

	const metaPixel = analyticsEndpoints.find(endpoint => endpoint.platform === 'meta');
	const metaEvents = getMetaEventFromVipEvent({
		vipSwap,
		eventType: type,
		emailCaptured,
	});

	// this is being logged from an api route in preview/production, so the sourceUrl is the referer_url
	const sourceUrl = (isDevelopment() ? visitor?.href : visitor?.referer_url) ?? '';

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
				fbclid: visitor?.fbclid ?? null,
			}).catch(async err => {
				await log({
					type: 'errors',
					location: 'recordVipEvent',
					message: `err reporting vip event to meta => ${err}`,
				});
				return { reported: false };
			})
		:	{ reported: false };

	// report event to tinybird
	try {
		// Extract journey info from visitor with proper defaults for VIP events
		const journeyId = visitor?.journeyId ?? visitor?.sessionId ?? newId('barelySession');
		const journeyOrigin = visitor?.journeyOrigin ?? journeyId.split('_')[0] ?? 'vip';
		const journeySource =
			visitor?.journeySource ?? `vip:${vipSwap.handle}:${vipSwap.key}`;
		const journeyStep = visitor?.journeyStep ? parseInt(visitor.journeyStep, 10) : 1;
		const journeyPath = visitor?.journeyPath ?? [`vip:${vipSwap.handle}:${vipSwap.key}`];

		await ingestVipEvent({
			timestamp,
			type,
			workspaceId: vipSwap.workspaceId,
			assetId: vipSwap.id,
			sessionId: journeyId,
			...flattenVisitorForIngest(visitor),
			href: sourceUrl,
			reportedToMeta: metaPixel && metaRes.reported ? metaPixel.id : '',
			vipSwapType: vipSwap.type,
			vipDownloadToken: downloadToken ?? '',
			vipEmailCaptured: emailCaptured ?? '',
			// Journey tracking fields with proper defaults
			journeyId,
			journeyOrigin,
			journeySource,
			journeyStep,
			journeyPath,
		});
	} catch (error) {
		await log({
			type: 'errors',
			location: 'recordVipEvent',
			message: `error ingesting vip event => ${String(error)}`,
		});
	}

	// increment stats on VipSwap
	switch (type) {
		case 'vip/view':
			await dbHttp
				.update(VipSwaps)
				.set({ pageViewCount: sqlIncrement(VipSwaps.pageViewCount) })
				.where(eq(VipSwaps.id, vipSwap.id));
			break;
		case 'vip/emailCapture':
			await dbHttp
				.update(VipSwaps)
				.set({ emailCount: sqlIncrement(VipSwaps.emailCount) })
				.where(eq(VipSwaps.id, vipSwap.id));
			break;
		case 'vip/download':
			await dbHttp
				.update(VipSwaps)
				.set({ downloadCount: sqlIncrement(VipSwaps.downloadCount) })
				.where(eq(VipSwaps.id, vipSwap.id));
			break;
	}

	// increment the workspace event usage count in db
	await dbHttp
		.update(Workspaces)
		.set({ eventUsage: sqlIncrement(Workspaces.eventUsage) })
		.where(eq(Workspaces.id, vipSwap.workspaceId));
}

function getMetaEventFromVipEvent({
	vipSwap,
	eventType,
	emailCaptured,
}: {
	vipSwap: VipSwap;
	eventType: (typeof WEB_EVENT_TYPES__VIP)[number];
	emailCaptured?: string;
}): MetaEvent[] | null {
	switch (eventType) {
		case 'vip/view':
			return [
				{
					eventName: 'barely.vip/view',
					customData: {
						vipSwapId: vipSwap.id,
						vipSwapType: vipSwap.type,
					},
				},
				{
					eventName: 'ViewContent',
					customData: {
						content_type: 'barely.vip/view',
						vipSwapId: vipSwap.id,
					},
				},
			];
		case 'vip/emailCapture':
			return [
				{
					eventName: 'barely.vip/emailCapture',
					customData: {
						vipSwapId: vipSwap.id,
						vipSwapType: vipSwap.type,
						email: emailCaptured,
					},
				},
				{
					eventName: 'Lead',
					customData: {
						content_type: 'barely.vip/emailCapture',
						vipSwapId: vipSwap.id,
					},
				},
			];
		case 'vip/download':
			return [
				{
					eventName: 'barely.vip/download',
					customData: {
						vipSwapId: vipSwap.id,
						vipSwapType: vipSwap.type,
					},
				},
				{
					eventName: 'CompleteRegistration',
					customData: {
						content_type: 'barely.vip/download',
						vipSwapId: vipSwap.id,
					},
				},
			];
		default:
			return null;
	}
}
