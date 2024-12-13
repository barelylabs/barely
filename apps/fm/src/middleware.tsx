import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { isDevelopment, isPreview } from '@barely/lib/utils/environment';
import { parseFmUrl, setVisitorCookies } from '@barely/lib/utils/middleware';
import { getAbsoluteUrl } from '@barely/lib/utils/url';

export async function middleware(req: NextRequest) {
	const pathname = req.nextUrl.pathname;
	const domain = req.headers.get('host');
	const params = req.nextUrl.searchParams;

	const referer = req.headers.get('referer');
	console.log('fm middleware referer', referer);

	const domainParts = domain?.split('.');
	// if barely is the first part of the domain, we assume it's structured as www.barely.fm/[handle]/[key]. Skip the rest of the middleware.
	if (isDevelopment() || domainParts?.[0] === 'barely') {
		const { handle, key } = parseFmUrl(req.url);
		const res = NextResponse.next();

		if (!handle || !key) {
			console.log('missing handle or key for barely', handle, key);
			// return res;
		}

		await setVisitorCookies({ req, res, handle, key, app: 'fm' });

		console.log('fm cookies (barely) >>', res.cookies.getAll());
		return res;
	}

	let handle: string | null = null;

	const key = pathname.replace('/', '');

	if (isPreview()) {
		handle = params.get('handle');
	} else if (domainParts && domainParts.length >= 2) {
		handle = domainParts[0] ?? null;
	}

	if (handle && key) {
		const url = getAbsoluteUrl('fm', `${handle}${pathname}`);

		const res = NextResponse.rewrite(url);
		await setVisitorCookies({ req, res, handle, key, app: 'fm' });

		console.log('fm cookies (rewrite) >>', res.cookies.getAll());
		console.log('rewriting to', url);
		return res;
	}

	const res = NextResponse.next();
	// setVisitorCookies({ req, res, handle, key });

	console.log('fm cookies (no rewrite) >>', res.cookies.getAll());
	// console.log('fm cookies (no rewrite) >>', res.cookies.getAll());
	return res;
}

export const config = {
	matcher: [
		/*
		 * Match all request paths except for the ones starting with:
		 * - api (API routes)
		 * - _next
		 * - _static
		 * - .well-known
		 * - favicon (favicon file)
		 * - logos (logos file)
		 * - sitemap (sitemap file)
		 * - site.webmanifest (site.webmanifest file)
		 */
		'/((?!api|_next|_static|.well-known|favicon|logos|sitemap|site.webmanifest).*)',
	],
};
