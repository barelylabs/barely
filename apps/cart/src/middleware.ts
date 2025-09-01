import type { NextFetchEvent, NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import {
	parseCartUrl,
	parseReqForVisitorInfo,
	setVisitorCookies,
} from '@barely/lib/middleware/request-parsing';
import { log } from '@barely/lib/utils/log';
import { getAbsoluteUrl, isDevelopment, newId } from '@barely/utils';

import type { CreateCartBody } from '~/app/api/cart/create/route';
import { cartEnv } from '~/env';

export async function middleware(req: NextRequest, ev: NextFetchEvent) {
	const domain = req.headers.get('host');
	const pathname = req.nextUrl.pathname;

	const modeAlreadySet =
		pathname.startsWith('/live/') || pathname.startsWith('/preview/');
	const { handle, key } =
		modeAlreadySet ?
			parseCartUrl(req.url.replace('/live', '').replace('/preview', ''))
		:	parseCartUrl(req.url);

	let cartId = req.cookies.get(`${handle}.${key}.cartId`)?.value;

	if (pathname.includes('/checkout') && !cartId && handle && key) {
		// generate optimistic ID
		cartId = newId('cart');
		const shipTo = {
			country: isDevelopment() ? 'UK' : req.headers.get('x-vercel-ip-country'),
			state: isDevelopment() ? 'England' : req.headers.get('x-vercel-ip-country-region'),
			city: isDevelopment() ? 'London' : req.headers.get('x-vercel-ip-city'),
		};

		const visitor = parseReqForVisitorInfo({ req, handle, key });

		// Call the API route to create the cart
		ev.waitUntil(
			fetch(`${req.nextUrl.origin}/api/cart/create`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					// Pass internal token to authenticate middleware requests
					'x-cart-internal-token': cartEnv.CART_INTERNAL_API_SECRET,
				},
				body: JSON.stringify({
					handle,
					key,
					cartId,
					shipTo,
					visitor,
				} satisfies CreateCartBody),
			}).catch(async err => {
				await log({
					location: 'cart/middleware.ts',
					message: `error calling cart creation API: ${String(err)}`,
					type: 'errors',
				});
			}),
		);
	}

	// trpcCaller
	// 	.create({
	// 		handle,
	// 		key,
	// 		shipTo,
	// 		cartId,
	// 	})
	// 	.catch(async err => {
	// 		await log({
	// 			location: 'cart/middleware.ts',
	// 			message: `error creating cart: ${String(err)}`,
	// 			type: 'errors',
	// 		});
	// 	}),

	/* the mode is already set in the URL */
	if (modeAlreadySet || pathname === '/') {
		const res = NextResponse.next();

		if (!handle || !key) return res;

		await setVisitorCookies({ req, res, handle, key, app: 'cart', cartId });

		return res;
	}

	/* the mode is set in the subdomain. set the mode in the URL */
	if (!handle || !key) {
		// todo: it'd be great to block people here based on trolling attempts. return a "stop trolling" 404 response

		await log({
			location: 'cart/middleware.ts',
			message: `missing handle or key for ${req.url}`,
			type: 'errors',
		});
	}

	if (domain?.startsWith('preview.')) {
		const previewUrl =
			getAbsoluteUrl('cart', `preview${pathname}`).replace('www.', 'preview.') +
			req.nextUrl.search;

		const res = NextResponse.rewrite(previewUrl);

		await setVisitorCookies({ req, res, handle, key, app: 'cart', cartId });

		return res;
	}

	/* assuming we are in live mode */
	const liveUrl = getAbsoluteUrl('cart', `live${pathname}${req.nextUrl.search}`);

	const res = NextResponse.rewrite(liveUrl);

	await setVisitorCookies({ req, res, handle, key, app: 'cart', cartId });

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
		 * - png files
		 */
		'/((?!api|_next|_static|.well-known|favicon|logos|sitemap|site.webmanifest|robots|.*\\.png).*)',
	],
};
