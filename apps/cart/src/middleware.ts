import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getUrl } from '@barely/lib/utils/url';

// This function can be marked `async` if using `await` inside
export function middleware(req: NextRequest) {
	const path = req.nextUrl.pathname;
	const domain = req.headers.get('host');

	console.log('domain', domain);
	console.log('path', path);

	if (domain?.startsWith('preview.')) {
		return NextResponse.rewrite(getUrl('cart', `preview${path}`));
	} else {
		return NextResponse.rewrite(getUrl('cart', `live${path}`));
	}
}

export const config = {
	matcher: [
		/*
		 * Match all request paths except for the ones starting with:
		 * - api (API routes)
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 */
		'/((?!api|_next/static|_next/image|favicon.ico).*)',
	],
};
