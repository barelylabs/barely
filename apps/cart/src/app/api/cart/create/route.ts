import type { VisitorInfo } from '@barely/lib/middleware/request-parsing';
import { NextResponse } from 'next/server';
import { ratelimit } from '@barely/lib';
import {
	createMainCartFromFunnel,
	getFunnelByParams,
} from '@barely/lib/functions/cart.fns';
import { log } from '@barely/lib/utils/log';
import { isDevelopment } from '@barely/utils';

import { cartEnv } from '~/env';

export interface CreateCartBody {
	handle: string;
	key: string;
	cartId: string;
	shipTo?: {
		country: string | null;
		state: string | null;
		city: string | null;
	};
	visitor: VisitorInfo;
}

// Rate limiters for different scenarios
const ipRateLimiter = ratelimit(10, '1 m'); // 10 requests per minute per IP
const funnelRateLimiter = ratelimit(1000, '1 h'); // 1000 carts per hour per funnel

export async function POST(request: Request) {
	try {
		// 1. Origin verification
		const origin = request.headers.get('origin');
		const referer = request.headers.get('referer');
		const internalToken = request.headers.get('x-cart-internal-token');

		// In production, verify the request comes from trusted sources
		if (!isDevelopment()) {
			const trustedOrigins = [
				`https://${cartEnv.NEXT_PUBLIC_APP_BASE_URL}`,
				`https://${cartEnv.NEXT_PUBLIC_CART_BASE_URL}`,
				`https://preview.${cartEnv.NEXT_PUBLIC_CART_BASE_URL}`,
				`https://${cartEnv.NEXT_PUBLIC_LINK_BASE_URL}`,
				`https://${cartEnv.NEXT_PUBLIC_PRESS_BASE_URL}`,
				`https://${cartEnv.NEXT_PUBLIC_WWW_BASE_URL}`,
			].filter(Boolean);

			// Check if it's an internal request from middleware (has special token)
			const isInternalRequest = internalToken === cartEnv.CART_INTERNAL_API_SECRET;

			// Check if origin/referer is from trusted source
			const isTrustedOrigin =
				origin && trustedOrigins.some(trusted => origin.startsWith(trusted));
			const isTrustedReferer =
				referer && trustedOrigins.some(trusted => referer.startsWith(trusted));

			if (!isInternalRequest && !isTrustedOrigin && !isTrustedReferer) {
				await log({
					location: 'api/cart/create',
					message: `Untrusted origin attempt: origin=${origin}, referer=${referer}`,
					type: 'alerts',
				});
				return NextResponse.json(
					{ error: 'Forbidden' },
					{
						status: 403,
						headers: {
							'Access-Control-Allow-Origin': 'https://cart.barely.ai',
						},
					},
				);
			}
		}

		const body = (await request.json()) as CreateCartBody;
		const { handle, key, cartId, shipTo, visitor } = body;

		if (!handle || !key || !cartId) {
			return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
		}

		// 2. Rate limiting by IP address (if we have visitor IP)
		if (visitor.ip) {
			const {
				success: ipSuccess,
				remaining,
				reset,
			} = await ipRateLimiter.limit(visitor.ip);

			if (!ipSuccess) {
				await log({
					location: 'api/cart/create',
					message: `IP rate limit exceeded for ${visitor.ip}`,
					type: 'alerts',
				});
				return NextResponse.json(
					{
						error: 'Too many requests',
						retryAfter: reset,
					},
					{
						status: 429,
						headers: {
							'X-RateLimit-Remaining': remaining.toString(),
							'X-RateLimit-Reset': new Date(reset).toISOString(),
						},
					},
				);
			}
		}

		// 3. Rate limiting by funnel
		const funnelKey = `${handle}:${key}`;
		const {
			success: funnelSuccess,
			remaining: funnelRemaining,
			reset: funnelReset,
		} = await funnelRateLimiter.limit(funnelKey);

		if (!funnelSuccess) {
			await log({
				location: 'api/cart/create',
				message: `Funnel rate limit exceeded for ${funnelKey}`,
				type: 'alerts',
			});
			return NextResponse.json(
				{
					error: 'Too many carts created for this funnel',
					retryAfter: funnelReset,
				},
				{
					status: 429,
					headers: {
						'X-RateLimit-Remaining': funnelRemaining.toString(),
						'X-RateLimit-Reset': new Date(funnelReset).toISOString(),
					},
				},
			);
		}

		const funnel = await getFunnelByParams(handle, key);

		if (!funnel) {
			await log({
				location: 'api/cart/create',
				message: `Funnel not found for ${handle}/${key}`,
				type: 'errors',
			});
			return NextResponse.json({ error: 'Funnel not found' }, { status: 404 });
		}

		const cart = await createMainCartFromFunnel({
			funnel,
			visitor, // Now we have visitor info passed from middleware
			shipTo,
			cartId,
		});

		return NextResponse.json({ success: true, cartId: cart.id });
	} catch (error) {
		await log({
			location: 'api/cart/create',
			message: `Error creating cart: ${String(error)}`,
			type: 'errors',
		});

		return NextResponse.json({ error: 'Failed to create cart' }, { status: 500 });
	}
}

// This endpoint should only accept POST requests
export function GET() {
	return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

// Handle OPTIONS requests for CORS
export function OPTIONS() {
	return new Response(null, {
		status: 200,
		headers: {
			'Access-Control-Allow-Origin': isDevelopment() ? '*' : 'https://cart.barely.ai',
			'Access-Control-Allow-Methods': 'POST, OPTIONS',
			'Access-Control-Allow-Headers': 'Content-Type, x-cart-internal-token',
			'Access-Control-Max-Age': '86400',
		},
	});
}
