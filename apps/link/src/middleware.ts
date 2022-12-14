import { NextRequest, NextResponse } from 'next/server';

// import type { LinkWithRemarketing } from '@barely/api/src/router/link';
// import type { MobileRedirectParams } from './app/mobile/[redirectParams]/page';

// import {
// 	visitorSessionBaseSchema,
// 	visitorSessionCreateSchema,
// } from '@barely/db/prisma/zod/visitorsession';
// import { eventCreateSchema } from '@barely/db/prisma/zod/event';

// import * as visitorSession from '../../../packages/edge/src/visitorSession';
// import type { ReportEventInput } from '@barely/api/src/router/event';

// export const config = {
// 	matcher: ['/((?!api|mobile|_next/static|favicon|sitemap|atom|404|500).*)'],
// };

// export async function middleware(req: any) {
export async function middleware(req: NextRequest) {
	console.log('middlewaaaare');

	// //* 🧬 parse the incoming request *//
	// const { origin, handle, slug, app, appRoute, appId, pathname } =
	// 	visitorSession.getPathParams(req);
	// if (!handle && pathname.length === 0) return; // redirect to barely.io/link?
	// if (pathname.length === 0) return NextResponse.rewrite(`${origin}/404`);

	// //* 🔎 get link data from db (we'll cache this with stale-while-revalidate) *//
	// const pathParams = new URLSearchParams({
	// 	handle,
	// 	slug: slug ?? '',
	// 	app: app ?? '',
	// 	appRoute: appRoute ?? '',
	// 	appId: appId ?? '',
	// }).toString();
	// const getLinkEndpoint = new URL(`/api/open/link/by-path?${pathParams}`, req.url);
	// const linkRes = await fetch(getLinkEndpoint.href);
	// const linkData: LinkWithRemarketing = await linkRes.json();
	// const { id: linkId, url: targetUrl, androidScheme, appleScheme } = linkData;

	// //* 🚧 handle route errors *//
	// if (!targetUrl) return NextResponse.rewrite(`${origin}/404`);
	// if (linkRes.status !== 200)
	// 	return NextResponse.rewrite(`${origin}/${linkRes.status ?? '500'}`);
	// // //* 🧭 route based on device platform and available schemes *//
	// // ➡️ 🍏 || 🤖 || 💻
	// const { platform, ...deviceProps } = visitorSession.getDeviceData(req);
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
	// //* 😎 🏖 🌞 🩴 *//
	// /* we can relax a little. the visitor has been routed to their
	// destination. now to do the analytics logging/reporting. */
	// //* ⏲ create session *//
	// const { ip, geo } = req;
	// const { browser, device, os, cpu, isBot, ua } = deviceProps;
	// const visitorSessionInput = visitorSessionCreateSchema.parse({
	// 	ip,
	// 	...geo,
	// 	browserName: browser.name,
	// 	browserVersion: browser.version,
	// 	cpu: cpu.architecture,
	// 	deviceModel: device.model,
	// 	deviceType: device.type,
	// 	deviceVendor: device.vendor,
	// 	isBot,
	// 	osName: os.name,
	// 	osVersion: os.version,
	// 	ua,
	// });
	// const createSessionEndpoint = new URL(`/api/open/visitor-session/create`, req.url);
	// const sessionRes = await fetch(createSessionEndpoint.href, {
	// 	method: 'POST',
	// 	headers: { 'Content-Type': 'application/json' },
	// 	body: JSON.stringify(visitorSessionInput),
	// });
	// const sessionData = visitorSessionBaseSchema.parse(await sessionRes.json());
	// //* 📈 create event *//
	// const createEventEndpoint = new URL(`/api/open/event/create`, req.url);
	// const eventInput = eventCreateSchema.parse({
	// 	linkId: linkId,
	// 	sessionId: sessionData.id,
	// 	type: 'pageView',
	// });
	// const eventRes = await fetch(createEventEndpoint.href, {
	// 	method: 'POST',
	// 	headers: { 'Content-Type': 'application/json' },
	// 	body: JSON.stringify(eventInput),
	// });
	// const eventData = eventCreateSchema.parse(await eventRes.json());
	// //* 📊 report event to remarketing && analytics *//
	// if (
	// 	!ip ||
	// 	!ua ||
	// 	!eventData.id ||
	// 	!linkData.remarketingEndpoints ||
	// 	linkData.remarketingEndpoints.length === 0
	// )
	// 	return;
	// const reportEventInput: ReportEventInput = {
	// 	url: targetUrl,
	// 	eventId: eventData.id,
	// 	geo,
	// 	ip,
	// 	ua,
	// 	remarketingEndpoints: linkData.remarketingEndpoints,
	// };
	// const reportEventEndpoint = new URL(`/api/open/event/report`, req.url);
	// return await fetch(reportEventEndpoint.href, {
	// 	method: 'POST',
	// 	headers: { 'Content-Type': 'application/json' },
	// 	body: JSON.stringify(reportEventInput),
	// });
	// //* 🎉 🎉 🎉 *//
}
