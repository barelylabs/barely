import { NextResponse } from 'next/server';
import { dbHttp } from '@barely/db/client';
import { Invoices } from '@barely/db/sql/invoice.sql';
import { generateInvoicePDFBase64 } from '@barely/lib/functions/invoice-pdf.fns';
import { and, eq, isNull } from 'drizzle-orm';

import { getSession } from '@barely/auth/app.server';

export async function POST(request: Request) {
	try {
		// Check authentication
		const session = await getSession();
		if (!session?.user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		// Parse request body
		const body = (await request.json()) as { handle?: string; invoiceId?: string };
		const { handle, invoiceId } = body;

		if (!handle || !invoiceId) {
			return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
		}

		// Get invoice with workspace and client data
		const invoice = await dbHttp.query.Invoices.findFirst({
			where: and(eq(Invoices.id, invoiceId), isNull(Invoices.deletedAt)),
			with: {
				workspace: {
					columns: {
						id: true,
						name: true,
						handle: true,
						shippingAddressLine1: true,
						shippingAddressLine2: true,
						shippingAddressCity: true,
						shippingAddressState: true,
						shippingAddressPostalCode: true,
						shippingAddressCountry: true,
						currency: true,
						supportEmail: true,
						invoiceSupportEmail: true,
					},
				},
				client: {
					columns: {
						name: true,
						email: true,
						company: true,
						address: true,
					},
				},
			},
		});

		if (!invoice) {
			return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
		}

		// Verify the handle matches the workspace
		if (invoice.workspace.handle !== handle) {
			return NextResponse.json({ error: 'Invalid handle for invoice' }, { status: 403 });
		}

		// Check if user has access to this workspace
		const hasAccess = session.user.workspaces.some(ws => ws.id === invoice.workspace.id);
		if (!hasAccess) {
			return NextResponse.json({ error: 'Access denied' }, { status: 403 });
		}

		// Generate PDF
		const pdfBase64 = await generateInvoicePDFBase64({
			invoice,
			workspace: invoice.workspace,
			client: invoice.client,
		});

		return NextResponse.json({
			pdf: pdfBase64,
			filename: `${invoice.workspace.name}-${invoice.invoiceNumber}.pdf`,
		});
	} catch (error) {
		console.error('Error generating PDF:', error);
		return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
	}
}
