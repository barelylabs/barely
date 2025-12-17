import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { dbEnv } from '@barely/db';

import { getSession } from '~/auth/server';

export const runtime = 'edge';

// Parameters that Electric Cloud doesn't support (used by local Electric only)
const UNSUPPORTED_PARAMS = ['log'];

/**
 * Electric SQL Shape Proxy Endpoint
 *
 * This endpoint proxies authenticated requests to Electric Cloud for real-time data sync.
 * It validates that the user is authenticated and forwards shape requests to Electric.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
	// Verify authentication
	const session = await getSession();
	if (!session?.user) {
		return new NextResponse('Unauthorized', { status: 401 });
	}

	// Check if Electric is configured
	if (!dbEnv.ELECTRIC_SOURCE_ID || !dbEnv.ELECTRIC_SECRET) {
		return new NextResponse('Electric SQL not configured', { status: 503 });
	}

	// Get the search params from the request
	const url = new URL(request.url);
	const searchParams = url.searchParams;

	// Build the Electric Cloud URL
	const electricUrl = new URL(`${dbEnv.ELECTRIC_URL}/v1/shape`);

	// Forward supported query parameters to Electric (filter out unsupported ones)
	searchParams.forEach((value, key) => {
		if (!UNSUPPORTED_PARAMS.includes(key)) {
			electricUrl.searchParams.set(key, value);
		}
	});

	// Add Electric Cloud authentication
	electricUrl.searchParams.set('source_id', dbEnv.ELECTRIC_SOURCE_ID);
	electricUrl.searchParams.set('secret', dbEnv.ELECTRIC_SECRET);

	console.log(
		'[Electric Proxy] Forwarding request to:',
		electricUrl.toString().replace(/secret=[^&]+/, 'secret=***'),
	);

	try {
		// Forward the request to Electric Cloud
		const response = await fetch(electricUrl.toString(), {
			method: 'GET',
			headers: {
				Accept: 'application/json',
				// Forward relevant headers for caching/streaming
				...(() => {
					const ifNoneMatch = request.headers.get('if-none-match');
					return ifNoneMatch ? { 'If-None-Match': ifNoneMatch } : {};
				})(),
			},
		});

		// Handle Electric's response
		if (!response.ok && response.status !== 304) {
			const errorBody = await response.text();
			console.error('[Electric Proxy] Error from Electric:', response.status, errorBody);
			// Return the actual error from Electric for debugging
			return new NextResponse(
				JSON.stringify({
					error: 'Error fetching from Electric',
					status: response.status,
					details: errorBody,
				}),
				{
					status: response.status,
					headers: { 'Content-Type': 'application/json' },
				},
			);
		}

		// Create response headers, forwarding important ones from Electric
		const responseHeaders = new Headers();

		// Forward caching headers
		const etag = response.headers.get('etag');
		if (etag) responseHeaders.set('ETag', etag);

		const cacheControl = response.headers.get('cache-control');
		if (cacheControl) responseHeaders.set('Cache-Control', cacheControl);

		// Forward ALL Electric-specific headers (any header starting with 'electric-')
		response.headers.forEach((value, key) => {
			if (key.toLowerCase().startsWith('electric-')) {
				responseHeaders.set(key, value);
			}
		});

		responseHeaders.set('Content-Type', 'application/json');

		// Add CORS headers to allow Electric headers to be read by the client
		responseHeaders.set(
			'Access-Control-Expose-Headers',
			'electric-handle, electric-offset, electric-schema, electric-cursor, electric-chunk-last-offset, electric-chunk-up-to-date',
		);

		// Return 304 if not modified
		if (response.status === 304) {
			return new NextResponse(null, {
				status: 304,
				headers: responseHeaders,
			});
		}

		// Stream the response body
		return new NextResponse(response.body, {
			status: response.status,
			headers: responseHeaders,
		});
	} catch (error) {
		console.error('Electric proxy error:', error);
		return new NextResponse('Internal Server Error', { status: 500 });
	}
}
