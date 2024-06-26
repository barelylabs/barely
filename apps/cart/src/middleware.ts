import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getAbsoluteUrl } from '@barely/lib/utils/url';

export function middleware(req: NextRequest) {
	const pathname = req.nextUrl.pathname;
	const domain = req.headers.get('host');

	console.log('domain', domain);
	console.log('path', pathname);
	// what about query params
	console.log('query', req.nextUrl.search);

	/* the mode is already set in the URL */
	if (
		pathname.startsWith('/live/') ||
		pathname.startsWith('/preview/') ||
		pathname === '/'
	) {
		return NextResponse.next();
	}

	/* the mode is set in the subdomain. set the mode in the URL */
	if (domain?.startsWith('preview.')) {
		const previewUrl =
			getAbsoluteUrl('cart', `preview${pathname}`).replace('www.', 'preview.') +
			req.nextUrl.search;
		console.log('pushing to preview', previewUrl);
		return NextResponse.rewrite(previewUrl);
	}

	/* assuming we are in live mode */
	const liveUrl = getAbsoluteUrl('cart', `live${pathname}${req.nextUrl.search}`);
	console.log('pushing to live', liveUrl);
	return NextResponse.rewrite(liveUrl);
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
