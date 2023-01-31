import { NextRequest, NextResponse } from 'next/server';
import { closestDbConnection, usEast1_dev } from '@barely/db/kysely';

import { visitorSession, zFetch } from '@barely/utils/edge';
import { linkAnalyticsSchema } from '@barely/schema/analytics/link';
import { z } from 'zod';

export const config = {
	matcher: ['/((?!api|mobile|_next|favicon|logos|sitemap|atom|404|500).*)'],
};

type AnalyticsInput = z.infer<typeof linkAnalyticsSchema>;

export async function middleware(req: NextRequest) {
	// console.log('middleware path => ', req.nextUrl.pathname);

	//* 🧬 parse the incoming request *//
	const { isLocal, origin, handle, slug, app, appRoute, appId, pathname } =
		visitorSession.getPathParams(req);

	if (!handle && pathname.length === 1) return; // redirect to barely.io/link?
	if (handle && pathname.length === 1)
		return NextResponse.redirect('https://barely.io/link');
	if (!handle || pathname.length === 1) return NextResponse.rewrite(`${origin}/404`);

	//* 🔎 get link data from db (planetscale serverless + kysely) *//
	const edgeDb = isLocal
		? usEast1_dev
		: closestDbConnection(req.geo?.longitude ?? '0', req.geo?.latitude ?? '0');

	const eqOrIs = (value: any) => (value ? '=' : 'is');

	const link = await edgeDb
		.selectFrom('Link')
		.select(['id', 'url', 'androidScheme', 'appleScheme', 'teamId'])
		.where('handle', '=', handle)
		.where('slug', eqOrIs(slug), slug)
		.where('app', eqOrIs(app), app)
		.where('appRoute', eqOrIs(appRoute), appRoute)
		.where('appId', eqOrIs(appId), appId)
		.executeTakeFirst();

	//* 🚧 handle route errors 🚧  *//
	if (!link || !link.url) return NextResponse.rewrite(`${origin}/404`);

	//* 📈 report event to analytics + remarketing *//
	const { ip, geo } = req;
	const { platform, ...deviceProps } = visitorSession.getDeviceData(req);
	const { browser, device, os, cpu, isBot, ua } = deviceProps;

	const analyticsInput = {
		linkId: link.id,
		teamId: link.teamId,
		url: req.nextUrl.href,
		// visitor info
		ip: isLocal ? process.env.VISITOR_IP : ip ?? '',
		ua: isLocal ? process.env.VISITOR_UA : ua,
		referrer: req.referrer,
		...geo,
		browserName: browser.name,
		browserVersion: browser.version,
		cpu: cpu.architecture,
		deviceModel: device.model,
		deviceType: device.type,
		deviceVendor: device.vendor,
		isBot,
		osName: os.name,
		osVersion: os.version,
	} satisfies AnalyticsInput;

	const analyticsEndpoint = new URL(`/api/analytics`, req.url);
	zFetch.post({
		endpoint: analyticsEndpoint.href,
		body: analyticsInput,
		schemaReq: linkAnalyticsSchema,
	});

	//* 🧭 route based on device platform and available schemes *//
	// ➡️ 🍏 || 🤖 || 💻
	return NextResponse.redirect(link.url); // 👈 just doing url redirects for now

	// const scheme =
	// 	platform === 'android' && androidScheme
	// 		? androidScheme
	// 		: platform === 'ios' && appleScheme
	// 		? appleScheme
	// 		: null;
	// // ➡️ 🤖 (android scheme w/ built-in fallback url)
	// if (platform === 'android' && androidScheme?.includes('S.browser_fallback_url'))
	// 	return NextResponse.redirect(androidScheme);
	// // ➡️ 💻 (web url)
	// if (platform === 'web' || !scheme) return NextResponse.redirect(targetUrl);
	// // ➡️ 📱 (🍏 || 🤖) (page with schema redirect & delayed fallback url)
	// const { ogTitle, ogDescription, ogImage, favicon } = linkData;
	// const mobileRedirectParams: MobileRedirectParams = {
	// 	scheme: encodeURIComponent(scheme),
	// 	fallback: encodeURIComponent(targetUrl),
	// 	ogTitle: encodeURIComponent(ogTitle ?? ''),
	// 	ogDescription: encodeURIComponent(ogDescription ?? ''),
	// 	ogImage: encodeURIComponent(ogImage ?? ''),
	// 	favicon: encodeURIComponent(favicon ?? ''),
	// };
	// const mobileRedirectParamsString = new URLSearchParams(mobileRedirectParams).toString();
	// NextResponse.redirect(`${origin}/mobile/${mobileRedirectParamsString}`);

	// //* 🎉 🎉 🎉 *//
}
