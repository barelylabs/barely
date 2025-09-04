import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { parseBioUrl, setVisitorCookies } from '@barely/lib/middleware/request-parsing';
import { log } from '@barely/lib/utils/log';

export async function middleware(req: NextRequest) {
	const { handle, key } = parseBioUrl(req.url);

	console.log('bio middleware', handle, key);

	const res = NextResponse.next();

	if (!handle) {
		await log({
			message: `missing handle for bio, handle: ${handle}`,
			type: 'errors',
			location: 'bio/middleware.ts',
		});
	}

	// Set visitor cookies to persist tracking parameters
	await setVisitorCookies({ req, res, handle, key, app: 'bio' });

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
