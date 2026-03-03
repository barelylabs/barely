import type { FM_LINK_PLATFORMS } from '@barely/const';
import type { NextGeo } from '@barely/validators/schemas';
import { sha256, zPost } from '@barely/utils';
import { z } from 'zod/v4';

import { log } from '../../utils/log';

export interface TiktokEventProperties {
	// tiktok standard params
	content_type?: 'product' | 'product_group';
	contents?: {
		content_id?: string;
		content_name?: string;
		content_category?: string;
		quantity?: number;
		price?: number;
	}[];
	content_id?: string;
	currency?: string;
	value?: number;
	description?: string;
	query?: string;

	/* barely params (custom data) */
	// cart
	cartId?: string;
	cartPurchaseType?: 'mainWithoutBump' | 'mainWithBump' | 'upsell';
	upsellProductId?: string;

	// fm
	fmId?: string;
	platform?: (typeof FM_LINK_PLATFORMS)[number];

	// link
	linkId?: string;

	// page
	pageId?: string;
	linkClickDestinationAssetId?: string;
	linkClickDestinationHref?: string;

	// vip
	vipSwapId?: string;
	vipSwapType?: string;
	email?: string;
}

export const TIKTOK_EVENT_NAMES = [
	// standard events - ref: https://ads.tiktok.com/help/article/standard-events-parameters
	'AddPaymentInfo',
	'AddToCart',
	'AddToWishlist',
	'ClickButton',
	'CompletePayment',
	'CompleteRegistration',
	'Contact',
	'Download',
	'InitiateCheckout',
	'Pageview',
	'PlaceAnOrder',
	'Search',
	'SubmitForm',
	'Subscribe',
	'ViewContent',

	// bio
	'barely.bio/view',
	'barely.bio/buttonClick',
	'barely.bio/emailCapture',

	// cart
	'barely.cart/viewCheckout',
	'barely.cart/addPaymentInfo',
	'barely.cart/addBump',
	'barely.cart/purchase',
	'barely.cart/viewUpsell',
	'barely.cart/purchaseUpsell',

	// fm
	'barely.fm/view',
	'barely.fm/linkClick',

	// link
	'barely.link/click',

	// page
	'barely.page/view',
	'barely.page/linkClick',

	// vip
	'barely.vip/view',
	'barely.vip/emailCapture',
	'barely.vip/download',

	// nyc
	'barely.nyc/pageView',
	'barely.nyc/contactFormSubmit',
	'barely.nyc/playlistSubmit',
	'barely.nyc/linkClick',
	'barely.nyc/ctaClick',
	'barely.nyc/discoveryCallClick',
] as const;

export type TiktokEventName = (typeof TIKTOK_EVENT_NAMES)[number];

export interface TiktokEvent {
	eventName: TiktokEventName;
	properties?: TiktokEventProperties;
}

export interface TiktokEventProps {
	pixelCode: string;
	accessToken: string;

	// event data
	sourceUrl: string;
	email?: string;
	phone?: string;
	firstName?: string;
	lastName?: string;
	ip?: string;
	ua?: string;
	geo?: NextGeo;

	// event data (specific to event)
	events: TiktokEvent[];

	// tracking data
	ttclid: string | null;
}

function buildTiktokUserData(props: {
	email?: string;
	phone?: string;
	ip?: string;
	ua?: string;
	ttclid?: string | null;
}) {
	return {
		...(props.email ? { email: sha256(props.email.toLowerCase()) } : {}),
		...(props.phone ? { phone: sha256(props.phone.replace(/\D/g, '')) } : {}),
		...(props.ip ? { ip: props.ip } : {}),
		...(props.ua ? { user_agent: props.ua } : {}),
		...(props.ttclid ? { ttclid: props.ttclid } : {}),
	};
}

export const tiktokEventResponseSchema = z.object({
	code: z.number(),
	message: z.string(),
	data: z.unknown().optional(),
});

export async function reportEventsToTiktok(props: TiktokEventProps) {
	const { pixelCode, accessToken, sourceUrl, events, ip, ua, email, phone } = props;

	const unixTimeSinceEpoch_s = Math.floor(Date.now() / 1000);

	const userData = buildTiktokUserData({
		email,
		phone,
		ip,
		ua,
		ttclid: props.ttclid,
	});

	const data = events.map(event => ({
		event: event.eventName,
		event_time: unixTimeSinceEpoch_s,
		event_id: `${event.eventName}_${unixTimeSinceEpoch_s}_${Math.random().toString(36).substring(2, 10)}`,
		user: userData,
		properties: event.properties ?? {},
		page: {
			url: sourceUrl,
		},
	}));

	try {
		const tiktokEventRes = await zPost(
			'https://business-api.tiktok.com/open_api/v1.3/event/track/',
			tiktokEventResponseSchema,
			{
				headers: {
					'Access-Token': accessToken,
				},
				body: {
					event_source: 'web',
					event_source_id: pixelCode,
					data,
				},
			},
		);

		if (tiktokEventRes.status !== 200) {
			await log({
				type: 'errors',
				location: 'reportEventsToTiktok',
				message: `TikTok API error: status ${tiktokEventRes.status}`,
			});
			return { reported: false };
		}

		return { reported: true };
	} catch (err) {
		return { reported: false, error: err as string };
	}
}
