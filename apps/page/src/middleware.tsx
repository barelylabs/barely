import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { isPreview } from '@barely/lib/utils/environment';
import { setVisitorCookies } from '@barely/lib/utils/middleware';
import { getAbsoluteUrl } from '@barely/lib/utils/url';

export function middleware(req: NextRequest) {
	const pathname = req.nextUrl.pathname;
	const domain = req.headers.get('host');
	const params = req.nextUrl.searchParams;

	console.log('pathname >', pathname);
	console.log('domain >', domain);

	const domainParts = domain?.split('.');
	console.log('domainParts >', domainParts);
	console.log('domainParts.length >', domainParts?.length);

	// if www is the first part of the domain, we assume it's structured as barely.page/[handle]/[key]. Skip the rest of the middleware.
	if (domainParts?.[0] === 'barely') {
		const res = NextResponse.next();
		setVisitorCookies(req, res);
		return res;
	}

	let handle: string | null = null;

	if (domainParts && domainParts.length >= 2) {
		handle = domainParts[0] ?? null;
	} else if (isPreview()) {
		handle = params.get('handle');
	}

	if (handle) {
		const url = getAbsoluteUrl('page', `/${handle}${pathname}`);

		const res = NextResponse.rewrite(url);
		setVisitorCookies(req, res);

		return res;
	}

	return NextResponse.next();
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
