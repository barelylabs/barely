import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { setVisitorCookies } from '@barely/lib/middleware/request-parsing';
import { log } from '@barely/lib/utils/log';

export async function middleware(req: NextRequest) {
	const pathname = req.nextUrl.pathname;

	// Parse the VIP URL to extract handle and key
	// VIP URLs are structured as /[handle]/unlock/[key]
	const parts = pathname.split('/').filter(Boolean);
	const handle = parts[0] ?? null;
	const key = parts[2] ?? null; // parts[1] is 'unlock'

	const res = NextResponse.next();

	if (!handle || !key) {
		await log({
			message: `missing handle or key for vip, ${handle}, ${key}`,
			type: 'errors',
			location: 'vip/middleware.tsx',
		});
		// Still set visitor cookies even if handle/key missing to track anonymous visits
		await setVisitorCookies({ req, res, handle: null, key: null, app: 'vip' });
		return res;
	}

	// Set visitor cookies with the extracted handle and key
	await setVisitorCookies({ req, res, handle, key, app: 'vip' });

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
		 * - robots.txt (robots file)
		 */
		'/((?!api|_next|_static|.well-known|favicon|logos|sitemap|site.webmanifest|robots.txt).*)',
	],
};
