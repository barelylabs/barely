import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { setVisitorCookies } from '@barely/lib/utils/middleware';
import { getAbsoluteUrl } from '@barely/lib/utils/url';

export function middleware(req: NextRequest) {
	const pathname = req.nextUrl.pathname;
	const domain = req.headers.get('host');

	console.log('domain', domain);
	console.log('path', pathname);
	console.log('query', req.nextUrl.search);

	/* the mode is already set in the URL */
	if (
		pathname.startsWith('/live/') ||
		pathname.startsWith('/preview/') ||
		pathname === '/'
	) {
		const res = NextResponse.next();
		setVisitorCookies(req, res);

		return res;
	}

	/* the mode is set in the subdomain. set the mode in the URL */
	if (domain?.startsWith('preview.')) {
		const previewUrl =
			getAbsoluteUrl('cart', `preview${pathname}`).replace('www.', 'preview.') +
			req.nextUrl.search;
		console.log('pushing to preview', previewUrl);

		const res = NextResponse.rewrite(previewUrl);
		setVisitorCookies(req, res);

		return res;
	}

	/* assuming we are in live mode */
	const liveUrl = getAbsoluteUrl('cart', `live${pathname}${req.nextUrl.search}`);
	console.log('pushing to live', liveUrl);

	const res = NextResponse.rewrite(liveUrl);
	setVisitorCookies(req, res);

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
