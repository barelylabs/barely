import 'server-only';

import type { NextRequest, NextResponse } from 'next/server';
import { userAgent } from 'next/server';
import {
	getDomainWithoutWWW,
	getRandomGeoData,
	isDevelopment,
	newId,
} from '@barely/utils';
import {
	formattedUserAgentSchema,
	nextGeoSchema,
	nextUserAgentToFormattedSchema,
} from '@barely/validators/schemas';
import { ipAddress } from '@vercel/edge';
import { geolocation } from '@vercel/functions';
import { z } from 'zod/v4';

import { libEnv } from '../../env';

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

const parseHeadersForHandleAndKey = (headers: Headers) => {
	const handleFromHeaders = headers.get('x-handle');
	const keyFromHeaders = headers.get('x-key');

	return { handle: handleFromHeaders, key: keyFromHeaders };
};

// cart
export const parseCartReqForHandleAndKey = (req: NextRequest) => {
	const { handle: handleFromHeaders, key: keyFromHeaders } = parseHeadersForHandleAndKey(
		req.headers,
	);

	if (handleFromHeaders && keyFromHeaders)
		return { handle: handleFromHeaders, key: keyFromHeaders };

	const referer = req.headers.get('referer');
	const { handle: handleFromReferer, key: keyFromReferer } =
		referer ? parseCartUrl(referer) : { handle: null, key: null };

	return {
		handle: handleFromHeaders ?? handleFromReferer,
		key: keyFromHeaders ?? keyFromReferer,
	};
};

export const parseCartUrl = (url: string) => {
	const parsed = new URL(url);
	const parts = parsed.pathname.split('/').filter(Boolean);

	const handle = parts[0] ?? null;
	const key = parts[1] ?? null;

	if (!handle || !key) {
		console.log('parseCartUrl', url);
		console.log('missing handle or key', handle, key);
	}

	return { handle, key };
};

// bio
export const parseBioReqForHandleAndKey = (req: NextRequest) => {
	const { handle: handleFromHeaders, key: keyFromHeaders } = parseHeadersForHandleAndKey(
		req.headers,
	);

	if (handleFromHeaders && keyFromHeaders)
		return { handle: handleFromHeaders, key: keyFromHeaders };

	const referer = req.headers.get('referer');
	console.log('parseBioReqForHandleAndKey - referer:', referer);

	const { handle: handleFromReferer, key: keyFromReferer } =
		referer ? parseBioUrl(referer) : { handle: null, key: null };

	return {
		handle: handleFromHeaders ?? handleFromReferer,
		key: keyFromHeaders ?? keyFromReferer,
	};
};

export const parseBioUrl = (url: string) => {
	const parsed = new URL(url);
	const parts = parsed.pathname.split('/').filter(Boolean);

	const handle = parts[0] ?? null;
	// If we have more than one part, use the rest as the key (like FM)
	// Otherwise, if we have a handle but no key, default to 'home'
	const key =
		parts.slice(1).length ? parts.slice(1).join('/')
		: handle ? 'home'
		: null;

	if (!handle || !key) {
		console.log('parseBioUrl', url);
		console.log('missing handle or key', handle, key);
	}

	return { handle, key };
};

// fm
export const parseFmReqForHandleAndKey = (req: NextRequest) => {
	const { handle: handleFromHeaders, key: keyFromHeaders } = parseHeadersForHandleAndKey(
		req.headers,
	);

	if (handleFromHeaders && keyFromHeaders)
		return { handle: handleFromHeaders, key: keyFromHeaders };

	const referer = req.headers.get('referer') ?? '';
	const { handle: handleFromReferer, key: keyFromReferer } = parseFmUrl(referer);

	return {
		handle: handleFromHeaders ?? handleFromReferer,
		key: keyFromHeaders ?? keyFromReferer,
	};
};

export const parseFmUrl = (url: string) => {
	const parsed = new URL(url);
	const parts = parsed.pathname.split('/').filter(Boolean);

	const handle = parts[0] ?? null;
	const key = parts.slice(1).length ? parts.slice(1).join('/') : null;

	if (!handle || !key) {
		console.log('parseFmUrl', url);
		console.log('missing handle or key', handle, key);
	}

	return { handle, key };
};

// page
export const parseLandingPageReqForHandleAndKey = (req: NextRequest) => {
	const { handle: handleFromHeaders, key: keyFromHeaders } = parseHeadersForHandleAndKey(
		req.headers,
	);

	if (handleFromHeaders && keyFromHeaders)
		return { handle: handleFromHeaders, key: keyFromHeaders };

	const referer = req.headers.get('referer') ?? '';
	const { handle: handleFromReferer, key: keyFromReferer } = parseLandingPageUrl(referer);

	return {
		handle: handleFromHeaders ?? handleFromReferer,
		key: keyFromHeaders ?? keyFromReferer,
	};
};

export const parseLandingPageUrl = (url: string) => {
	const parsed = new URL(url);
	const parts = parsed.pathname.split('/').filter(Boolean);

	const handle = parts[0] ?? null;
	const key = parts.slice(1).length ? parts.slice(1).join('/') : null;

	if (!handle || !key) {
		console.log('parsePageUrl', url);
		console.log('missing handle or key', handle, key);
	}

	return { handle, key };
};

// invoice
export const parseInvoiceReqForHandleAndKey = (req: NextRequest) => {
	const { handle: handleFromHeaders, key: keyFromHeaders } = parseHeadersForHandleAndKey(
		req.headers,
	);

	if (handleFromHeaders && keyFromHeaders)
		return { handle: handleFromHeaders, key: keyFromHeaders };

	const referer = req.headers.get('referer') ?? '';
	const { handle: handleFromReferer, key: keyFromReferer } = parseInvoiceUrl(referer);

	return {
		handle: handleFromHeaders ?? handleFromReferer,
		key: keyFromHeaders ?? keyFromReferer,
	};
};

export const parseInvoiceUrl = (url: string) => {
	const parsed = new URL(url);
	const parts = parsed.pathname.split('/').filter(Boolean);

	// Invoice URLs are structured as /pay/[handle]/[invoiceId]
	// parts[0] is 'pay', parts[1] is handle, parts[2] is invoiceId (key)
	const handle = parts[1] ?? null;
	const key = parts[2] ?? null;

	if (!handle || !key) {
		console.log('parseInvoiceUrl', url);
		console.log('missing handle or key', handle, key);
	}

	return { handle, key };
};

// vip
export const parseVipReqForHandleAndKey = (req: NextRequest) => {
	const { handle: handleFromHeaders, key: keyFromHeaders } = parseHeadersForHandleAndKey(
		req.headers,
	);

	console.log('parseVipReq - headers:', handleFromHeaders, keyFromHeaders);

	if (handleFromHeaders && keyFromHeaders)
		return { handle: handleFromHeaders, key: keyFromHeaders };

	const referer = req.headers.get('referer') ?? '';
	console.log('parseVipReq - referer:', referer);

	const { handle: handleFromReferer, key: keyFromReferer } = parseVipUrl(referer);
	console.log('parseVipReq - parsed from referer:', handleFromReferer, keyFromReferer);

	return {
		handle: handleFromHeaders ?? handleFromReferer,
		key: keyFromHeaders ?? keyFromReferer,
	};
};

export const parseVipUrl = (url: string) => {
	const parsed = new URL(url);
	const parts = parsed.pathname.split('/').filter(Boolean);

	console.log('parseVipUrl - url:', url);
	console.log('parseVipUrl - pathname:', parsed.pathname);
	console.log('parseVipUrl - parts:', parts);

	// VIP URLs are structured as /[handle]/unlock/[key]
	const handle = parts[0] ?? null;
	const key = parts[2] ?? null; // parts[1] is 'unlock'

	if (!handle || !key) {
		console.log('parseVipUrl - missing handle or key', handle, key);
	}

	return { handle, key };
};

// common
export function parseGeo(req: NextRequest) {
	const geo = geolocation(req);

	return isDevelopment() ? getRandomGeoData() : (
			nextGeoSchema.parse({
				country:
					geo.country ??
					decodeURIComponent(req.headers.get('x-vercel-ip-country') ?? 'Unknown'),
				region:
					geo.region ??
					decodeURIComponent(req.headers.get('x-vercel-ip-country-region') ?? 'Unknown'),
				city:
					geo.city ??
					decodeURIComponent(req.headers.get('x-vercel-ip-city') ?? 'Unknown'),
				latitude: geo.latitude ?? req.headers.get('x-vercel-ip-latitude') ?? 'Unknown',
				longitude: geo.longitude ?? req.headers.get('x-vercel-ip-longitude') ?? 'Unknown',
				zip: 'Unknown',
			})
		);
}

export function parseUserAgent(req: NextRequest) {
	return nextUserAgentToFormattedSchema.parse(userAgent(req));
}

export function parseIp(req: NextRequest) {
	return ipAddress(req) ?? libEnv.LOCALHOST_IP;
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

// session
export function parseSession({
	req,
	handle,
	key,
}: {
	req: NextRequest;
	handle: string | null;
	key: string | null;
}) {
	const handleAndKeyExist = handle && key;
	const params = req.nextUrl.searchParams;

	// Check for fanId in query params first, then cookies
	const fanIdFromQuery = params.get('fid');
	const fanId =
		fanIdFromQuery ??
		(handleAndKeyExist ?
			req.cookies.get(`${handle}.${key}.fanId`)?.value
		:	req.cookies.getAll().find(cookie => cookie.name.endsWith('.fanId'))?.value) ??
		null;

	// Check for sessionId in query params first, then cookies
	const sessionIdFromQuery = params.get('sid');
	const sessionId =
		sessionIdFromQuery ??
		(handleAndKeyExist ?
			req.cookies.get(`${handle}.${key}.bsid`)?.value
		:	req.cookies.getAll().find(cookie => cookie.name.endsWith('.bsid'))?.value) ??
		null;
	const sessionReferer =
		(handleAndKeyExist ?
			req.cookies.get(`${handle}.${key}.sessionReferer`)?.value
		:	req.cookies.getAll().find(cookie => cookie.name.endsWith('.sessionReferer'))
				?.value) ?? null;
	const sessionRefererUrl =
		(handleAndKeyExist ?
			req.cookies.get(`${handle}.${key}.sessionRefererUrl`)?.value
		:	req.cookies.getAll().find(cookie => cookie.name.endsWith('.sessionRefererUrl'))
				?.value) ?? null;
	const sessionRefererId =
		(handleAndKeyExist ?
			req.cookies.get(`${handle}.${key}.sessionRefererId`)?.value
		:	req.cookies.getAll().find(cookie => cookie.name.endsWith('.sessionRefererId'))
				?.value) ?? null;

	const sessionEmailBroadcastId =
		(handleAndKeyExist ?
			req.cookies.get(`${handle}.${key}.sessionEmailBroadcastId`)?.value
		:	req.cookies.getAll().find(cookie => cookie.name.endsWith('.sessionEmailBroadcastId'))
				?.value) ?? null;
	const sessionEmailTemplateId =
		(handleAndKeyExist ?
			req.cookies.get(`${handle}.${key}.sessionEmailTemplateId`)?.value
		:	req.cookies.getAll().find(cookie => cookie.name.endsWith('.sessionEmailTemplateId'))
				?.value) ?? null;
	const sessionFlowActionId =
		(handleAndKeyExist ?
			req.cookies.get(`${handle}.${key}.sessionFlowActionId`)?.value
		:	req.cookies.getAll().find(cookie => cookie.name.endsWith('.sessionFlowActionId'))
				?.value) ?? null;
	const sessionLandingPageId =
		(handleAndKeyExist ?
			req.cookies.get(`${handle}.${key}.sessionLandingPageId`)?.value
		:	req.cookies.getAll().find(cookie => cookie.name.endsWith('.sessionLandingPageId'))
				?.value) ?? null;

	const fbclid =
		(handleAndKeyExist ?
			req.cookies.get(`${handle}.${key}.fbclid`)?.value
		:	req.cookies.getAll().find(cookie => cookie.name.endsWith('.fbclid'))?.value) ?? null;

	const sessionMetaCampaignId =
		(handleAndKeyExist ?
			req.cookies.get(`${handle}.${key}.sessionMetaCampaignId`)?.value
		:	req.cookies.getAll().find(cookie => cookie.name.endsWith('.sessionMetaCampaignId'))
				?.value) ?? null;

	const sessionMetaAdsetId =
		(handleAndKeyExist ?
			req.cookies.get(`${handle}.${key}.sessionMetaAdsetId`)?.value
		:	req.cookies.getAll().find(cookie => cookie.name.endsWith('.sessionMetaAdsetId'))
				?.value) ?? null;

	const sessionMetaAdId =
		(handleAndKeyExist ?
			req.cookies.get(`${handle}.${key}.sessionMetaAdId`)?.value
		:	req.cookies.getAll().find(cookie => cookie.name.endsWith('.sessionMetaAdId'))
				?.value) ?? null;

	const sessionMetaPlacement =
		(handleAndKeyExist ?
			req.cookies.get(`${handle}.${key}.sessionMetaPlacement`)?.value
		:	req.cookies.getAll().find(cookie => cookie.name.endsWith('.sessionMetaPlacement'))
				?.value) ?? null;

	return {
		fanId,
		fbclid,
		sessionId,
		sessionMetaCampaignId,
		sessionMetaAdsetId,
		sessionMetaAdId,
		sessionMetaPlacement,
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
	href: z.string(),

	fanId: z.string().nullable(),
	// session
	sessionId: z.string().nullable(),
	fbclid: z.string().nullable(),
	sessionMetaCampaignId: z.string().nullable(),
	sessionMetaAdsetId: z.string().nullable(),
	sessionMetaAdId: z.string().nullable(),
	sessionMetaPlacement: z.string().nullable(),
	sessionReferer: z.string().nullable(),
	sessionRefererUrl: z.string().nullable(),
	sessionRefererId: z.string().nullable(),
	sessionEmailBroadcastId: z.string().nullable(),
	sessionEmailTemplateId: z.string().nullable(),
	sessionFlowActionId: z.string().nullable(),
	sessionLandingPageId: z.string().nullable(),
});
export type VisitorInfo = z.input<typeof visitorInfoSchema>;

export function parseReqForVisitorInfo({
	req,
	handle,
	key,
}: {
	req: NextRequest;
	handle: string | null;
	key: string | null;
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
		href,
		...visitorSession,
	} satisfies VisitorInfo;
}

export async function setVisitorCookies({
	req,
	res,
	app,
	cartId,
	...handleAndKey
}: {
	req: NextRequest;
	res: NextResponse;
	handle: string | null;
	key: string | null;
	app: 'cart' | 'link' | 'fm' | 'page' | 'press' | 'nyc' | 'www' | 'vip';
	cartId?: string;
}) {
	const handle = handleAndKey.handle ?? '_';
	const key = handleAndKey.key ?? '_';

	const params = req.nextUrl.searchParams;
	const { referer, referer_url } = parseReferer(req);

	await Promise.resolve(1); // fixme

	// Check for sessionId in query params - if present, use it to override/set cookie
	const sessionIdFromQuery = params.get('sid');
	if (sessionIdFromQuery) {
		res.cookies.set(`${handle}.${key}.bsid`, sessionIdFromQuery, {
			httpOnly: true,
			maxAge: 60 * 60 * 24,
		});
	} else if (!req.cookies.get(`${handle}.${key}.bsid`)) {
		// Only generate new sessionId if not in query params and not in cookies
		// For cart app, use provided cartId if available, otherwise generate new ID
		const sessionId =
			app === 'cart' ? (cartId ?? newId('cart'))
			: app === 'link' ? newId('linkClick')
			: app === 'fm' ? newId('fmSession')
			: app === 'page' ? newId('landingPageSession')
			: app === 'www' ? newId('wwwSession')
			: app === 'nyc' ? newId('nycSession')
			: app === 'vip' ? newId('vipSession')
			: newId('barelySession');

		res.cookies.set(`${handle}.${key}.bsid`, sessionId, {
			httpOnly: true,
			maxAge: 60 * 60 * 24,
		});
	}

	// For cart app, also set the cartId cookie if provided
	if (app === 'cart' && cartId && !req.cookies.get(`${handle}.${key}.cartId`)) {
		res.cookies.set(`${handle}.${key}.cartId`, cartId, {
			httpOnly: true,
			maxAge: 60 * 60 * 24,
		});
	}

	if (referer && !req.cookies.get(`${handle}.${key}.sessionReferer`))
		res.cookies.set(`${handle}.${key}.sessionReferer`, referer, {
			httpOnly: true,
			maxAge: 60 * 60 * 24,
		});

	if (referer_url && !req.cookies.get(`${handle}.${key}.sessionRefererUrl`))
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

	// Handle fanId from query params - using 'fid' for consistency with sessionId 'sid'
	const fanIdFromQuery = params.get('fid') ?? params.get('fanId');
	if (fanIdFromQuery) {
		res.cookies.set(`${handle}.${key}.fanId`, fanIdFromQuery, {
			httpOnly: true,
			maxAge: 60 * 60 * 24,
		});
	}

	if (params.has('fbclid'))
		res.cookies.set(`${handle}.${key}.fbclid`, params.get('fbclid') ?? '', {
			httpOnly: true,
			maxAge: 60 * 60 * 24,
		});

	if (params.has('metaCampaignId'))
		res.cookies.set(
			`${handle}.${key}.sessionMetaCampaignId`,
			params.get('metaCampaignId') ?? '',
			{
				httpOnly: true,
				maxAge: 60 * 60 * 24,
			},
		);

	if (params.has('metaAdsetId'))
		res.cookies.set(
			`${handle}.${key}.sessionMetaAdsetId`,
			params.get('metaAdsetId') ?? '',
			{
				httpOnly: true,
				maxAge: 60 * 60 * 24,
			},
		);

	if (params.has('metaAdId'))
		res.cookies.set(`${handle}.${key}.sessionMetaAdId`, params.get('metaAdId') ?? '', {
			httpOnly: true,
			maxAge: 60 * 60 * 24,
		});

	if (params.has('metaPlacement'))
		res.cookies.set(
			`${handle}.${key}.sessionMetaPlacement`,
			params.get('metaPlacement') ?? '',
			{
				httpOnly: true,
				maxAge: 60 * 60 * 24,
			},
		);

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
	ip: libEnv.LOCALHOST_IP,
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
	sessionMetaCampaignId: null,
	sessionMetaAdsetId: null,
	sessionMetaAdId: null,
	sessionMetaPlacement: null,
	sessionEmailBroadcastId: null,
	sessionEmailTemplateId: null,
	sessionFlowActionId: null,
	sessionLandingPageId: null,
};
