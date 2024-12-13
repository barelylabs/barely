import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { log } from '@barely/lib/utils/log';
import { parseCartUrl, setVisitorCookies } from '@barely/lib/utils/middleware';
import { getAbsoluteUrl } from '@barely/lib/utils/url';

export async function middleware(req: NextRequest) {
	const domain = req.headers.get('host');
	const pathname = req.nextUrl.pathname;

	// console.log('middleware domain', domain);
	// console.log('middleware path', pathname);
	// console.log('middleware query', req.nextUrl.search);

	/* the mode is already set in the URL */
	if (
		pathname.startsWith('/live/') ||
		pathname.startsWith('/preview/') ||
		pathname === '/'
	) {
		const res = NextResponse.next();

		const { handle, key } = parseCartUrl(
			req.url.replace('/live', '').replace('/preview', ''),
		);

		if (!handle || !key) {
			// console.log('missing handle or key for /live or /preview', handle, key);
			return res;
		}

		if (!handle || !key) {
			console.log('missing handle or key for /live or /preview', handle, key);
			// return res;
		}

		await setVisitorCookies({ req, res, handle, key, app: 'cart' });

		return res;
	}

	/* the mode is set in the subdomain. set the mode in the URL */

	const { handle, key } = parseCartUrl(req.url);

	if (domain?.startsWith('preview.')) {
		const previewUrl =
			getAbsoluteUrl('cart', `preview${pathname}`).replace('www.', 'preview.') +
			req.nextUrl.search;
		console.log('pushing to preview', previewUrl);

		const res = NextResponse.rewrite(previewUrl);

		// if (!handle || !key) {

		// 	return res;
		// }

		if (!handle || !key) {
			await log({
				location: 'cart/middleware.ts',
				message: 'missing handle or key for preview',
				type: 'errors',
			});
		}

		await setVisitorCookies({ req, res, handle, key, app: 'cart' });

		return res;
	}

	/* assuming we are in live mode */
	const liveUrl = getAbsoluteUrl('cart', `live${pathname}${req.nextUrl.search}`);
	// console.log('pushing to live', liveUrl);

	const res = NextResponse.rewrite(liveUrl);

	if (!handle || !key) {
		await log({
			location: 'cart/middleware.ts',
			message: 'missing handle or key for live',
			type: 'errors',
		});
	}

	await setVisitorCookies({ req, res, handle, key, app: 'cart' });

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
		 * - robots (robots file)
		 */
		'/((?!api|_next|_static|.well-known|favicon|logos|sitemap|site.webmanifest|robots).*)',
	],
};
