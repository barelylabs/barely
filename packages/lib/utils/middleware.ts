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
import { isDevelopment } from './environment';
import { newId } from './id';
import { getDomainWithoutWWW } from './link';
import { raise } from './raise';

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

// cart
export const parseCartUrl = (url: string) => {
	const parsed = new URL(url);
	const parts = parsed.pathname.split('/').filter(Boolean);

	const handle = parts[0] ?? raise('handle is required');
	const key = parts[1] ?? raise('key is required');

	return { handle, key };
};

// fm
export const parseFmUrl = (url: string) => {
	console.log('parseFmUrl', url);
	const parsed = new URL(url);
	const parts = parsed.pathname.split('/').filter(Boolean);

	const handle = parts[0] ?? raise('handle is required');
	const key = parts.slice(1).join('/') ?? raise('key is required');

	return { handle, key };
};

// page
export const parsePageUrl = (url: string) => {
	const parsed = new URL(url);
	const parts = parsed.pathname.split('/').filter(Boolean);

	const handle = parts[0] ?? raise('handle is required');
	const key = parts.slice(1).join('/') ?? raise('key is required');

	return { handle, key };
};

export function parseGeo(req: NextRequest) {
	return isDevelopment() ? getRandomGeoData() : (
			nextGeoSchema.parse({
				country:
					req.geo?.country ??
					decodeURIComponent(req.headers.get('x-vercel-ip-country') ?? 'Unknown'),
				region:
					req.geo?.region ??
					decodeURIComponent(req.headers.get('x-vercel-ip-country-region') ?? 'Unknown'),
				city:
					req.geo?.city ??
					decodeURIComponent(req.headers.get('x-vercel-ip-city') ?? 'Unknown'),
				latitude:
					req.geo?.latitude ?? req.headers.get('x-vercel-ip-latitude') ?? 'Unknown',
				longitude:
					req.geo?.longitude ?? req.headers.get('x-vercel-ip-longitude') ?? 'Unknown',
				zip: 'Unknown',
			})
		);
}

export function parseUserAgent(req: NextRequest) {
	return nextUserAgentToFormattedSchema.parse(userAgent(req));
}

export function parseIp(req: NextRequest) {
	return ipAddress(req) ?? env.LOCALHOST_IP;
}

export function parseReferer(req: NextRequest) {
	let referer_url = req.headers.get('referer'); // today i learned that referer is spelled wrong (https://en.wikipedia.org/wiki/HTTP_referer)

	if (!referer_url) {
		// let's check for signs it's from meta
		const ua = parseUserAgent(req);
		if (ua.browser === 'Instagram') referer_url = 'http://instagram.com';
		if (ua.browser === 'Facebook') referer_url = 'http://facebook.com';
		//fixme: add more as needed. also, is this an appropriate thing to do?
	}

	const referer = referer_url ? getDomainWithoutWWW(referer_url) : null;

	return { referer, referer_url };
}

export function parseSession({
	req,
	handle,
	key,
}: {
	req: NextRequest;
	handle: string;
	key: string;
}) {
	const fanId = req.cookies.get(`${handle}.${key}.fanId`)?.value ?? null;
	const sessionId = req.cookies.get(`${handle}.${key}.bsid`)?.value ?? null;
	const sessionReferer =
		req.cookies.get(`${handle}.${key}.sessionReferer`)?.value ?? null;
	const sessionRefererUrl =
		req.cookies.get(`${handle}.${key}.sessionRefererUrl`)?.value ?? null;
	const sessionRefererId =
		req.cookies.get(`${handle}.${key}.sessionRefererId`)?.value ?? null;
	const fbclid = req.cookies.get(`${handle}.${key}.fbclid`)?.value ?? null;
	const sessionEmailBroadcastId =
		req.cookies.get(`${handle}.${key}.sessionEmailBroadcastId`)?.value ?? null;
	const sessionEmailTemplateId =
		req.cookies.get(`${handle}.${key}.sessionEmailTemplateId`)?.value ?? null;
	const sessionFlowActionId =
		req.cookies.get(`${handle}.${key}.sessionFlowActionId`)?.value ?? null;
	const sessionLandingPageId =
		req.cookies.get(`${handle}.${key}.sessionLandingPageId`)?.value ?? null;

	return {
		fanId,
		fbclid,
		sessionId,
		sessionReferer,
		sessionRefererUrl,
		sessionRefererId,
		sessionEmailBroadcastId,
		sessionEmailTemplateId,
		sessionFlowActionId,
		sessionLandingPageId,
	};
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

	fanId: z.string().nullable(),
	// session
	sessionId: z.string().nullable(),
	fbclid: z.string().nullable(),
	sessionReferer: z.string().nullable(),
	sessionRefererUrl: z.string().nullable(),
	sessionRefererId: z.string().nullable(),
	sessionEmailBroadcastId: z.string().nullable(),
	sessionEmailTemplateId: z.string().nullable(),
	sessionFlowActionId: z.string().nullable(),
	sessionLandingPageId: z.string().nullable(),
});
export type VisitorInfo = z.infer<typeof visitorInfoSchema>;

export function parseReqForVisitorInfo({
	req,
	handle,
	key,
}: {
	req: NextRequest;
	handle: string;
	key: string;
}) {
	const ip = parseIp(req);
	const geo = parseGeo(req);
	const userAgent = parseUserAgent(req);
	const isBot = detectBot(req);
	const href = req.nextUrl.href;
	const { referer, referer_url } = parseReferer(req);

	const visitorSession = parseSession({ req, handle, key });

	return {
		ip,
		geo,
		userAgent,
		isBot,
		referer,
		referer_url,
		// referer_id,
		href,
		...visitorSession,
	} satisfies VisitorInfo;
}

export function setVisitorCookies({
	req,
	res,
	handle,
	key,
}: {
	req: NextRequest;
	res: NextResponse;
	handle: string;
	key: string;
}) {
	const params = req.nextUrl.searchParams;
	const { referer, referer_url } = parseReferer(req);

	if (!res.cookies.get(`${handle}.${key}.bsid`)) {
		res.cookies.set(`${handle}.${key}.bsid`, newId('barelySession'), {
			httpOnly: true,
			maxAge: 60 * 60 * 24,
		});
	}

	if (referer && !res.cookies.get(`${handle}.${key}.sessionReferer`))
		res.cookies.set(`${handle}.${key}.sessionReferer`, referer, {
			httpOnly: true,
			maxAge: 60 * 60 * 24,
		});

	if (referer_url && !res.cookies.get(`${handle}.${key}.sessionRefererUrl`))
		res.cookies.set(`${handle}.${key}.sessionRefererUrl`, referer_url, {
			httpOnly: true,
			maxAge: 60 * 60 * 24,
		});

	// params
	if (params.has('emailBroadcastId'))
		res.cookies.set(
			`${handle}.${key}.sessionEmailBroadcastId`,
			params.get('emailBroadcastId') ?? '',
			{
				httpOnly: true,
				maxAge: 60 * 60 * 24,
			},
		);

	if (params.has('emailTemplateId'))
		res.cookies.set(
			`${handle}.${key}.sessionEmailTemplateId`,
			params.get('emailTemplateId') ?? '',
			{
				httpOnly: true,
				maxAge: 60 * 60 * 24,
			},
		);

	if (params.has('fanId'))
		res.cookies.set(`${handle}.${key}.fanId`, params.get('fanId') ?? '', {
			httpOnly: true,
			maxAge: 60 * 60 * 24,
		});

	if (params.has('fbclid'))
		res.cookies.set(`${handle}.${key}.fbclid`, params.get('fbclid') ?? '', {
			httpOnly: true,
			maxAge: 60 * 60 * 24,
		});

	if (params.has('flowActionId'))
		res.cookies.set(
			`${handle}.${key}.sessionFlowActionId`,
			params.get('flowActionId') ?? '',
			{
				httpOnly: true,
				maxAge: 60 * 60 * 24,
			},
		);

	if (params.has('landingPageId'))
		res.cookies.set(
			`${handle}.${key}.sessionLandingPageId`,
			params.get('landingPageId') ?? '',
			{
				httpOnly: true,
				maxAge: 60 * 60 * 24,
			},
		);

	if (params.has('refererId') && !res.cookies.get(`${handle}.${key}.sessionRefererId`))
		res.cookies.set(`${handle}.${key}.sessionRefererId`, params.get('refererId') ?? '', {
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
	fanId: null,
	fbclid: null,
	sessionEmailBroadcastId: null,
	sessionEmailTemplateId: null,
	sessionFlowActionId: null,
	sessionLandingPageId: null,
};
