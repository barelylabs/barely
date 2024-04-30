import type { NextRequest } from 'next/server';
import { userAgent } from 'next/server';
import { ipAddress } from '@vercel/edge';

import { env } from '../env';
import {
	nextGeoSchema,
	nextUserAgentToFormattedSchema,
} from '../server/next/next.schema';
import { getRandomGeoData } from '../server/routes/link/link.constants';
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
		:	nextGeoSchema.parse(req.geo);
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

export function parseReqForVisitorInfo(req: NextRequest) {
	const ip = parseIp(req);
	const geo = parseGeo(req);
	const ua = parseUserAgent(req);
	const isBot = detectBot(req);
	const href = req.nextUrl.href;
	const { referer, referer_url } = parseReferer(req);

	return { ip, geo, ua, isBot, referer, referer_url, href };
}

export type VisitorInfo = ReturnType<typeof parseReqForVisitorInfo>;

export const DEFAULT_VISITOR_INFO: VisitorInfo = {
	ip: env.LOCALHOST_IP,
	geo: getRandomGeoData(),
	ua: {
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
	href: 'https://localhost:3000/',
};
