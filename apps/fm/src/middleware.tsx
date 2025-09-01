import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { parseFmUrl, setVisitorCookies } from '@barely/lib/middleware/request-parsing';
import { log } from '@barely/lib/utils/log';
import { getAbsoluteUrl, isDevelopment, isPreview } from '@barely/utils';

export async function middleware(req: NextRequest) {
	const pathname = req.nextUrl.pathname;
	const domain = req.headers.get('host');
	const params = req.nextUrl.searchParams;

	const domainParts = domain?.split('.');
	// if barely is the first part of the domain, we assume it's structured as www.barely.fm/[handle]/[key]. Skip the rest of the middleware.
	if (isDevelopment() || domainParts?.[0] === 'barely') {
		const { handle, key } = parseFmUrl(req.url);
		const res = NextResponse.next();

		if (!handle || !key) {
			await log({
				message: `missing handle or key for barely, ${handle}, ${key}`,
				type: 'errors',
				location: 'fm/middleware.tsx',
			});
		}

		await setVisitorCookies({ req, res, handle, key, app: 'fm' });

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

		return res;
	}

	const res = NextResponse.next();

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
		'/((?!api|_next|_static|.well-known|favicon|logos|sitemap|site.webmanifest|robots.txt|$).*)',
	],
};
