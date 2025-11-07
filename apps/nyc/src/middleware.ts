import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { setVisitorCookies } from '@barely/lib/middleware/request-parsing';

export async function middleware(req: NextRequest) {
	const res = NextResponse.next();

	// Set visitor cookies to persist tracking parameters (fbclid, sessionId, etc.)
	// NYC is a single-site app, so we use a fixed handle of 'barely' and key of 'nyc'
	await setVisitorCookies({ req, res, handle: 'barely', key: 'nyc', app: 'nyc' });

	return res;
}

export const config = {
	matcher: [
		/*
		 * Match all request paths except for the ones starting with:
		 * - api (API routes)
		 * - _next (Next.js internals)
		 * - _static (static files)
		 * - .well-known (security/config files)
		 * - favicon (favicon file)
		 * - sitemap (sitemap file)
		 * - robots (robots.txt file)
		 */
		'/((?!api|_next|_static|.well-known|favicon|sitemap|robots).*)',
	],
};
