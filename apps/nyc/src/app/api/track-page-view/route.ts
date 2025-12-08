import type { NextRequest } from 'next/server';
import { recordNYCEvent } from '@barely/lib/functions/nyc-event.fns';
import { parseReqForVisitorInfo } from '@barely/lib/middleware/request-parsing';
import { isProduction } from '@barely/utils';

export async function POST(req: NextRequest) {
	try {
		// Parse visitor info for Meta Pixel tracking
		const visitor = parseReqForVisitorInfo({
			req,
			handle: 'barely',
			key: 'nyc',
		});

		// Track page view to Meta Pixel
		await recordNYCEvent({
			type: 'nyc/pageView',
			visitor,
		});

		const successResponse = new Response(JSON.stringify({ success: true }), {
			status: 200,
			headers: { 'Content-Type': 'application/json' },
		});
		setCorsHeaders(successResponse);
		return successResponse;
	} catch (error) {
		console.error('Page view tracking error:', error);
		const response = new Response('Internal server error', { status: 500 });
		setCorsHeaders(response);
		return response;
	}
}

function setCorsHeaders(res: Response) {
	const origin = isProduction() ? 'https://barely.nyc' : '*';

	res.headers.set('Access-Control-Allow-Origin', origin);
	res.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
	res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
	res.headers.set('Access-Control-Max-Age', '86400');
}

export function OPTIONS() {
	const response = new Response(null, {
		status: 204,
	});
	setCorsHeaders(response);
	return response;
}
