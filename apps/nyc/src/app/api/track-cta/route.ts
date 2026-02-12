import type { NextRequest } from 'next/server';
import { recordNYCEvent } from '@barely/lib/functions/nyc-event.fns';
import { parseReqForVisitorInfo } from '@barely/lib/middleware/request-parsing';
import { isProduction } from '@barely/utils';
import { z } from 'zod/v4';

const trackCtaSchema = z.object({
	ctaType: z.enum(['contact_form', 'discovery_call']),
	ctaLocation: z.enum(['hero', 'features', 'pricing', 'faq', 'footer']),
	service: z.enum(['stan', 'rising_with_stan']).optional(),
});

export async function POST(req: NextRequest) {
	try {
		const body: unknown = await req.json();
		const parsed = trackCtaSchema.safeParse(body);

		if (!parsed.success) {
			const response = new Response('Invalid request body', { status: 400 });
			setCorsHeaders(response);
			return response;
		}

		const { ctaType, ctaLocation, service } = parsed.data;

		// Parse visitor info for Meta Pixel tracking
		const visitor = parseReqForVisitorInfo({
			req,
			handle: 'barely',
			key: 'nyc',
		});

		// Determine event type based on CTA type
		const eventType =
			ctaType === 'discovery_call' ? 'nyc/discoveryCallClick' : 'nyc/ctaClick';

		// Track CTA click to Meta Pixel
		await recordNYCEvent({
			type: eventType,
			visitor,
			customData: {
				cta_type: ctaType,
				cta_location: ctaLocation,
				service_interest: service,
				source_page: '/services/stan',
			},
		});

		const successResponse = new Response(JSON.stringify({ success: true }), {
			status: 200,
			headers: { 'Content-Type': 'application/json' },
		});
		setCorsHeaders(successResponse);
		return successResponse;
	} catch (error) {
		console.error('CTA tracking error:', error);
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
