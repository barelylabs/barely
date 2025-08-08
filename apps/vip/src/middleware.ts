import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { setVisitorCookies } from '@barely/lib/middleware/request-parsing';

export async function middleware(req: NextRequest) {
	const pathname = req.nextUrl.pathname;
	const domain = req.headers.get('host');

	console.log('vip middleware pathname', pathname);
	console.log('vip middleware domain', domain);

	// Parse the VIP URL to extract handle and key
	// VIP URLs are structured as /[handle]/unlock/[key]
	const parts = pathname.split('/').filter(Boolean);
	const handle = parts[0] ?? null;
	const key = parts[2] ?? null; // parts[1] is 'unlock'

	console.log('vip middleware handle', handle);
	console.log('vip middleware key', key);

	const res = NextResponse.next();

	if (!handle || !key) {
		console.log('vip middleware: missing handle or key', handle, key);
		// Still set visitor cookies even if handle/key missing to track anonymous visits
		await setVisitorCookies({ req, res, handle: null, key: null, app: 'vip' });
		return res;
	}

	// Set visitor cookies with the extracted handle and key
	await setVisitorCookies({ req, res, handle, key, app: 'vip' });

	console.log('vip cookies set for', handle, key);
	console.log('vip cookies >>', res.cookies.getAll());

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
