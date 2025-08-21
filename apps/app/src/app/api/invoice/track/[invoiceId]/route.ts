import type { NextRequest } from 'next/server';
import { dbHttp } from '@barely/db/client';
import { Invoices } from '@barely/db/sql';
import { ratelimit } from '@barely/lib';
import { log } from '@barely/lib/utils/log';
import { eq } from 'drizzle-orm';

// 1x1 transparent GIF
const TRACKING_PIXEL = Buffer.from(
	'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
	'base64',
);

export async function GET(
	req: NextRequest,
	{ params }: { params: { invoiceId: string } },
) {
	try {
		const { invoiceId } = params;
		const { searchParams } = new URL(req.url);
		const isReminder = searchParams.get('reminder') === 'true';

		if (!invoiceId) {
			return new Response('Invalid invoice ID', { status: 400 });
		}

		// Rate limit by invoice ID (100 requests per hour per invoice to prevent abuse)
		const invoiceRateLimit = ratelimit(100, '1 h');
		const { success } = await invoiceRateLimit.limit(`invoice-track:${invoiceId}`);

		// If rate limit exceeded, still return pixel but don't update database
		if (!success) {
			return new Response(TRACKING_PIXEL, {
				status: 200,
				headers: {
					'Content-Type': 'image/gif',
					'Cache-Control': 'no-store, no-cache, must-revalidate, private',
					Pragma: 'no-cache',
					Expires: '0',
				},
			});
		}

		// Update invoice viewedAt timestamp and status
		const invoice = await dbHttp
			.select()
			.from(Invoices)
			.where(eq(Invoices.id, invoiceId))
			.limit(1);

		if (!invoice[0]) {
			// Still return the pixel even if invoice not found to avoid revealing info
			return new Response(TRACKING_PIXEL, {
				status: 200,
				headers: {
					'Content-Type': 'image/gif',
					'Cache-Control': 'no-store, no-cache, must-revalidate, private',
					Pragma: 'no-cache',
					Expires: '0',
				},
			});
		}

		// Only update if not already viewed or if this is the first view
		if (!invoice[0].viewedAt || isReminder) {
			await dbHttp
				.update(Invoices)
				.set({
					viewedAt: new Date(),
					status: invoice[0].status === 'sent' ? 'viewed' : invoice[0].status,
					updatedAt: new Date(),
				})
				.where(eq(Invoices.id, invoiceId));

			// Log the tracking event
			await log({
				type: 'logs',
				message: `Invoice ${invoice[0].invoiceNumber} viewed${isReminder ? ' (reminder)' : ''}`,
				data: {
					invoiceId,
					invoiceNumber: invoice[0].invoiceNumber,
					workspaceId: invoice[0].workspaceId,
					isReminder,
				},
			});
		}

		// Return the tracking pixel
		return new Response(TRACKING_PIXEL, {
			status: 200,
			headers: {
				'Content-Type': 'image/gif',
				'Cache-Control': 'no-store, no-cache, must-revalidate, private',
				Pragma: 'no-cache',
				Expires: '0',
			},
		});
	} catch (error) {
		console.error('Error tracking invoice view:', error);

		// Still return the pixel on error to avoid breaking email clients
		return new Response(TRACKING_PIXEL, {
			status: 200,
			headers: {
				'Content-Type': 'image/gif',
				'Cache-Control': 'no-store, no-cache, must-revalidate, private',
			},
		});
	}
}
