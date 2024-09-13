import { z } from 'zod';

import type { NextGeo } from '../next/next.schema';
import type { FM_LINK_PLATFORMS } from '../routes/fm/fm.constants';
import { env } from '../../env';
import { isDevelopment } from '../../utils/environment';
import { sha256 } from '../../utils/hash';
import { log } from '../../utils/log';
import { zPost } from '../../utils/zod-fetch';
import { z_optStr_hash, z_optStr_lowerCase_hash } from '../../utils/zod-helpers';

export interface MetaEventCustomData {
	// meta params
	content_category?: string;
	content_ids?: string[];
	content_name?: string;
	content_type?: string;
	currency?: string;
	num_items?: number;
	value?: number;

	/* barely params */
	// cart
	cartId?: string;
	cartPurchaseType?: 'mainWithoutBump' | 'mainWithBump' | 'upsell';
	upsellProductId?: string;

	// fm
	fmId?: string;
	platform?: (typeof FM_LINK_PLATFORMS)[number];

	// link
	linkType?: 'short' | 'transparent';

	// page
	pageId?: string;
	linkClickDestinationAssetId?: string;
	linkClickDestinationHref?: string;
}

const META_EVENT_NAMES = [
	// standard events - ref: https://developers.facebook.com/docs/meta-pixel/reference
	'AddPaymentInfo',
	'AddToCart',
	'AddToWishlist',
	'CompleteRegistration',
	'Contact',
	'CustomizeProduct',
	'Donate',
	'FindLocation',
	'InitiateCheckout',
	'Lead',
	'PageView',
	'Purchase',
	'Schedule',
	'Search',
	'StartTrial',
	'SubmitApplication',
	'Subscribe',
	'ViewContent',

	// cart
	'barely.cart/viewCheckout',
	'barely.cart/updateMainProductPayWhatYouWantPrice',
	'barely.cart/addEmail',
	'barely.cart/addShippingInfo',
	'barely.cart/addPaymentInfo',
	'barely.cart/addBump',
	'barely.cart/removeBump',
	'barely.cart/purchase',
	'barely.cart/viewUpsell',
	'barely.cart/declineUpsell',
	'barely.cart/viewOrderConfirmation',

	// fm
	'barely.fm/view',
	'barely.fm/linkClick',

	// link
	'barely.link/click',

	// page
	'barely.page/view',
	'barely.page/linkClick',
] as const;

export type MetaEventName = (typeof META_EVENT_NAMES)[number];
export interface MetaEvent {
	eventName: MetaEventName;
	customData: MetaEventCustomData;
}

export interface MetaEventProps {
	pixelId: string;
	accessToken: string;

	// event data (covers all events)
	sourceUrl: string;
	ip?: string;
	ua?: string;
	time?: number;
	geo?: NextGeo;
	eventId?: string;
	testEventCode?: string;

	// event data (specific to event)
	events: MetaEvent[];

	// tracking data
	fbclid: string | null;
}

export async function reportEventsToMeta(props: MetaEventProps) {
	const { ip, geo, ua, time } = props;
	const { pixelId, accessToken, sourceUrl, events } = props;

	const urlObject = new URL(sourceUrl);
	const fbclid = props.fbclid ?? urlObject.searchParams.get('fbclid');

	const unixTimeSinceEpoch_ms = Math.floor(time ?? Date.now()); // unix timestamp in ms
	const unixTimeSinceEpoch_s = Math.floor(unixTimeSinceEpoch_ms / 1000); // unix timestamp in seconds

	const userData = metaUserDataSchema.parse({
		ip,
		ua,
		city: geo?.city,
		state: geo?.region,
		country: geo?.country,
		fbc: fbclid ? `fb.1.${unixTimeSinceEpoch_ms}.${fbclid}` : undefined,
	});

	const data: (z.infer<typeof metaServerEventSchema> & { user_data: typeof userData })[] =
		[];

	events.map(event => {
		const safeParsedEvent = metaServerEventSchema.safeParse({
			eventName: event.eventName,
			eventTime: unixTimeSinceEpoch_s,
			actionSource: 'website',
			sourceUrl,
			customData: event.customData,
		});

		if (safeParsedEvent.success) {
			data.push({ ...safeParsedEvent.data, user_data: userData });
		}
	});

	// const serverEventData = metaServerEventSchema.parse({
	// 	eventName,
	// 	eventTime: unixTimeSinceEpoch_s,
	// 	actionSource: 'website',
	// 	sourceUrl,
	// 	customData: props.customData,
	// });

	const testEventCode = isDevelopment() ? env.META_TEST_EVENT_CODE : undefined;

	if (testEventCode)
		await log({
			type: 'link',
			fn: 'reportEventToMeta',
			message: `testEventCode => ${testEventCode}`,
		});
	try {
		const metaEventResJson = await zPost(
			`https://graph.facebook.com/v15.0/${pixelId}/events`,
			metaEventResponseSchema,
			{
				body: {
					access_token: accessToken,
					data,
					// data: [{ user_data: userData, ...serverEventData }],

					// test event code
					...(testEventCode !== undefined && {
						test_event_code: testEventCode,
					}),
				},
			},
		);

		console.log('metaEventResponse => ', metaEventResJson);
		return { reported: true };
	} catch (err) {
		return { reported: false, error: err as string };
	}
}

export const metaUserDataSchema = z
	.object({
		email: z
			.string()
			.email()
			.optional()
			.transform(em => sha256(em)), // email
		phone: z_optStr_hash, // phone
		firstName: z_optStr_hash, // first name
		lastName: z_optStr_hash, // last name
		dateOfBirth: z_optStr_hash, // date of birth
		gender: z.enum(['m', 'fm']).optional(), // gender
		city: z_optStr_lowerCase_hash, // city
		state: z_optStr_lowerCase_hash, // state
		zipCode: z_optStr_lowerCase_hash, // zip
		country: z_optStr_lowerCase_hash, // country
		ip: z.string().optional(), // ip
		ua: z.string(), // ua -- required for web events
		leadId: z.string().optional(), // lead id
		externalId: z_optStr_hash, // external id
		fbc: z.string().optional(), // fbclid
	})
	// https://developers.facebook.com/docs/marketing-api/conversions-api/parameters/customer-information-parameters
	.transform(obj => ({
		em: obj.email,
		ph: obj.phone,
		fn: obj.firstName,
		ln: obj.lastName,
		db: obj.dateOfBirth,
		ge: obj.gender,
		ct: obj.city,
		st: obj.state,
		zp: obj.zipCode,
		country: obj.country,
		external_id: obj.externalId,
		client_ip_address: obj.ip,
		client_user_agent: obj.ua,
		lead_id: obj.leadId,
		fbc: obj.fbc,
	}));

export const metaServerEventSchema = z
	.object({
		// required
		eventName: z.string().min(1).max(40),
		eventTime: z.number().int().min(0),
		// userData: metaUserDataSchema,
		actionSource: z.enum(['website', 'mobile_app']),
		sourceUrl: z.string().url(),
		// optional
		customData: z.record(z.coerce.string()).optional(),
		optOut: z.boolean().optional(),
		eventId: z.string().optional(),
	})
	// https://developers.facebook.com/docs/marketing-api/conversions-api/parameters/server-event
	.transform(obj => ({
		event_name: obj.eventName,
		event_time: obj.eventTime,
		// user_data: obj.userData,
		action_source: obj.actionSource,
		event_source_url: obj.sourceUrl,
		custom_data: obj.customData,
		opt_out: obj.optOut,
		event_id: obj.eventId,
	}));

export const metaEventResponseSchema = z.object({
	events_received: z.number().optional(),
	messages: z.array(z.string()).optional(),
	fbtrace_id: z.string().optional(),
	error: z
		.object({
			message: z.string(),
			type: z.string(),
			code: z.number(),
			error_subcode: z.number().optional(),
			error_user_title: z.string().optional(),
			error_user_msg: z.string().optional(),
			is_transient: z.boolean().optional(),
			fbtrace_id: z.string().optional(),
		})
		.optional(),
});
