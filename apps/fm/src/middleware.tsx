import type { NextFetchEvent, NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { isPreview } from '@barely/lib/utils/environment';
import { getAbsoluteUrl } from '@barely/lib/utils/url';

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
export async function middleware(req: NextRequest, ev: NextFetchEvent) {
	const pathname = req.nextUrl.pathname;
	const domain = req.headers.get('host');
	const params = req.nextUrl.searchParams;

	console.log('pathname >', pathname);
	console.log('domain >', domain);

	const domainParts = domain?.split('.');
	console.log('domainParts >', domainParts);
	console.log('domainParts.length >', domainParts?.length);

	// if www is the first part of the domain, we assume it's structured as www.barely.com/[handle]/[key]. Skip the rest of the middleware.
	if (domainParts?.[0] === 'www') {
		return NextResponse.next();
	}

	let handle: string | null = null;

	if (domainParts && domainParts.length >= 2) {
		handle = domainParts[0] ?? null;
	} else if (isPreview()) {
		handle = params.get('handle');
	}

	if (handle) {
		const url = getAbsoluteUrl('page', `/${handle}${pathname}`);
		console.log('rewriting to', url);
		return NextResponse.rewrite(url);
	}

	ev.waitUntil(Promise.resolve().then(() => console.log('waitUntil')));

	return NextResponse.next();
}
