import { z } from 'zod';
import { geoSchema } from '@barely/zod/next';
import {
	metaUserDataSchema,
	metaServerEventSchema,
	metaEventRequestBodySchema,
	metaEventResponseSchema,
} from './schema';

import { _fetch } from '@barely/edge';

interface MetaEventProps {
	pixelId: string;
	accessToken: string;
	// event data
	url: string;
	ip: string;
	ua?: string;
	eventName: string;
	time?: number;
	geo?: z.infer<typeof geoSchema>;
}

export async function reportEvent(props: MetaEventProps) {
	const { pixelId, accessToken, url, eventName } = props;
	const { ip, geo, ua, time } = props;

	const userData = metaUserDataSchema.parse({
		ip,
		ua,
		city: geo?.city,
		state: geo?.region,
		country: geo?.country,
	});

	const metaServerEvent = metaServerEventSchema.parse({
		eventName,
		eventTime: Math.floor(time ?? Date.now() / 1000),
		actionSource: 'website',
		sourceUrl: url,
		userData,
	});

	const metaEventRequestBody = metaEventRequestBodySchema.parse({
		data: [metaServerEvent],
	});

	try {
		const endpoint = `https://graph.facebook.com/v15.0/${pixelId}/events`;
		const body = JSON.stringify({ access_token: accessToken, data: metaEventRequestBody });
		const schemaRes = metaEventResponseSchema;
		const metaEventResJson = await _fetch.post({ endpoint, body, schemaRes });

		// const metaEventRes = await fetch(metaEventEndpoint, {
		// 	method: 'POST',
		// 	headers: {
		// 		'Content-Type': 'application/x-www-form-urlencoded',
		// 	},
		// 	body: new URLSearchParams({
		// 		access_token: accessToken,
		// 		data: JSON.stringify(metaEventRequestBody),
		// 	}),
		// });
		// const metaEventResJson = await metaEventRes.json();
		console.log('metaEventResponse => ', metaEventResJson);
		return { reported: true };
	} catch (err) {
		return { reported: false, error: err as string };
	}
}
