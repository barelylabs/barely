import type { NextRequest, NextResponse } from 'next/server';
import { userAgent } from 'next/server';
import { ipAddress } from '@vercel/edge';
import { z } from 'zod';

import { env } from '../env';
import {
	formattedUserAgentSchema,
	nextGeoSchema,
	nextUserAgentToFormattedSchema,
} from '../server/next/next.schema';
import { getRandomGeoData } from '../server/routes/link/link.constants';
import { newId } from './id';
import { getDomainWithoutWWW } from './link';

export const detectBot = (req: NextRequest) => {
	const url = req.nextUrl;
	if (url.searchParams.get('bot')) return true;
	const ua = req.headers.get('User-Agent');
	if (ua) {
		/* Note:
		 * - bot is for most bots & crawlers
		 * - ChatGPT is for ChatGPT
		 * - facebookexternalhit is for Facebook crawler
		 * - WhatsApp is for WhatsApp crawler
		 * - MetaInspector is for https://metatags.io/
		 */
		return /bot|chatgpt|facebookexternalhit|WhatsApp|google|baidu|bing|msn|duckduckbot|teoma|slurp|yandex|MetaInspector/i.test(
			ua,
		);
	}
	return false;
};

export function parseGeo(req: NextRequest) {
	return env.VERCEL_ENV === 'development' ?
			getRandomGeoData()
		:	nextGeoSchema.parse({
				country: req.geo?.country ?? req.headers.get('x-vercel-ip-country') ?? 'US',
				region: req.geo?.region ?? req.headers.get('x-vercel-ip-country-region') ?? 'NY',
				city: req.geo?.city ?? req.headers.get('x-vercel-ip-city') ?? 'New York',
				latitude: req.geo?.latitude ?? req.headers.get('x-vercel-ip-latitude') ?? 40.7128,
				longitude:
					req.geo?.longitude ?? req.headers.get('x-vercel-ip-longitude') ?? -74.006,
			});
}

export function parseUserAgent(req: NextRequest) {
	return nextUserAgentToFormattedSchema.parse(userAgent(req));
}

export function parseIp(req: NextRequest) {
	return ipAddress(req) ?? env.LOCALHOST_IP;
}

export function parseReferer(req: NextRequest) {
	const referer_url = req.headers.get('referer'); // today i learned that referer is spelled wrong (https://en.wikipedia.org/wiki/HTTP_referer)
	const referer = referer_url ? getDomainWithoutWWW(referer_url) : null;

	return { referer, referer_url };
}

export function parseSession(req: NextRequest) {
	const sessionId = req.cookies.get('bsid')?.value ?? null;
	const sessionReferer = req.cookies.get('sessionReferer')?.value ?? null;
	const sessionRefererUrl = req.cookies.get('sessionRefererUrl')?.value ?? null;
	const sessionRefererId = req.cookies.get('sessionRefererId')?.value ?? null;
	const fbclid = req.cookies.get('fbclid')?.value ?? null;

	return { sessionId, sessionReferer, sessionRefererUrl, sessionRefererId, fbclid };
}

export const visitorInfoSchema = z.object({
	ip: z.string(),
	geo: nextGeoSchema,
	userAgent: formattedUserAgentSchema,
	isBot: z.boolean(),
	referer: z.string().nullable(),
	referer_url: z.string().nullable(),
	// referer_id: z.string().nullable(),
	href: z.string(),
	// session
	sessionId: z.string().nullable(),
	fbclid: z.string().nullable(),
	sessionReferer: z.string().nullable(),
	sessionRefererUrl: z.string().nullable(),
	sessionRefererId: z.string().nullable(),
});
export type VisitorInfo = z.infer<typeof visitorInfoSchema>;

export function parseReqForVisitorInfo(req: NextRequest) {
	const ip = parseIp(req);
	const geo = parseGeo(req);
	const userAgent = parseUserAgent(req);
	const isBot = detectBot(req);
	const href = req.nextUrl.href;
	const { referer, referer_url } = parseReferer(req);

	const { sessionId, sessionReferer, sessionRefererUrl, sessionRefererId, fbclid } =
		parseSession(req);

	return {
		ip,
		geo,
		userAgent,
		isBot,
		referer,
		referer_url,
		// referer_id,
		href,
		sessionId,
		fbclid,
		sessionReferer,
		sessionRefererUrl,
		sessionRefererId,
	} satisfies VisitorInfo;
}

export function setVisitorCookies(req: NextRequest, res: NextResponse) {
	const params = req.nextUrl.searchParams;
	const { referer, referer_url } = parseReferer(req);

	const barelySessionId = res.cookies.get('bsid');

	if (!barelySessionId) {
		res.cookies.set('bsid', newId('barelySession'), {
			httpOnly: true,
			maxAge: 60 * 60 * 24,
		});
	}

	if (referer)
		res.cookies.set('sessionReferer', referer, { httpOnly: true, maxAge: 60 * 60 * 24 });

	if (referer_url)
		res.cookies.set('sessionRefererUrl', referer_url, {
			httpOnly: true,
			maxAge: 60 * 60 * 24,
		});

	const sessionRefererId = res.cookies.get('sessionRefererId')?.value;
	if (sessionRefererId)
		res.cookies.set('sessionRefererId', sessionRefererId, {
			httpOnly: true,
			maxAge: 60 * 60 * 24,
		});

	if (params.has('fbclid'))
		res.cookies.set('fbclid', params.get('fbclid') ?? '', {
			httpOnly: true,
			maxAge: 60 * 60 * 24,
		});

	return;
}

export const DEFAULT_VISITOR_INFO: VisitorInfo = {
	ip: env.LOCALHOST_IP,
	geo: getRandomGeoData(),
	userAgent: {
		ua: 'Unknown',
		browser: 'Unknown',
		browser_version: 'Unknown',
		device: 'Unknown',
		engine: 'Unknown',
		engine_version: 'Unknown',
		os: 'Unknown',
		os_version: 'Unknown',
		bot: false,
		device_model: 'Unknown',
		device_vendor: 'Unknown',
		cpu_architecture: 'Unknown',
	},
	isBot: false,
	referer: null,
	referer_url: null,
	sessionId: null,
	sessionReferer: null,
	sessionRefererUrl: null,
	sessionRefererId: null,
	href: 'https://localhost:3000/',
	fbclid: null,
};
