import { z } from 'zod';

import { geoSchema } from '../../schema/next';
import { sha256 } from '../../utils/edge/hash';
import { zPost } from '../../utils/edge/zod-axios';
import { z_optStr_hash, z_optStr_lowerCase_hash } from '../../utils/edge/zod-helpers';

interface MetaEventProps {
	pixelId: string;
	accessToken: string;
	// event data
	url: string;
	ip?: string;
	ua?: string;
	eventName: string;
	time?: number;
	geo?: z.infer<typeof geoSchema>;
	testEventCode?: string;
}

export const report = async (props: MetaEventProps) => {
	const { pixelId, accessToken, url, eventName, testEventCode } = props;
	const { ip, geo, ua, time } = props;

	const userData = metaUserDataSchema.parse({
		ip,
		ua,
		city: geo?.city,
		state: geo?.region,
		country: geo?.country,
	});

	const serverEventData = metaServerEventSchema.parse({
		eventName,
		eventTime: Math.floor(time ?? Date.now() / 1000),
		actionSource: 'website',
		sourceUrl: url,
	});

	try {
		const metaEventResJson = await zPost({
			endpoint: `https://graph.facebook.com/v15.0/${pixelId}/events`,
			body: {
				access_token: accessToken,
				data: [{ user_data: userData, ...serverEventData }],
				test_event_code: testEventCode,
			},
			schema: metaEventResponseSchema,
		});

		console.log('metaEventResponse => ', metaEventResJson);
		return { reported: true };
	} catch (err) {
		return { reported: false, error: err as string };
	}
};

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
		customData: z.record(z.string()).optional(),
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
