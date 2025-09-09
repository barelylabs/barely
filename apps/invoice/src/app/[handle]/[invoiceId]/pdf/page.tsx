import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { getAbsoluteUrl } from '@barely/utils';

import { InvoiceRender } from '@barely/ui/invoice';

import { trpcCaller } from '~/trpc/server';

import './page.module.css';

import { invoiceEnv } from '~/env';

interface PageProps {
	params: Promise<{
		handle: string;
		invoiceId: string;
	}>;
}

export default async function InvoicePDFPage({ params }: PageProps) {
	const { handle, invoiceId } = await params;
	const headersList = await headers();

	// Check for internal PDF request header for server-side access
	const isServerRequest =
		headersList.get('X-Internal-PDF-Request') === invoiceEnv.INTERNAL_PDF_SECRET;

	if (!isServerRequest) {
		console.log('🔐 Not a server request. Redirecting to payment page...');
		// For regular requests, redirect to the public payment page
		const paymentUrl = getAbsoluteUrl('invoice', `/pay/${handle}/${invoiceId}`);
		return (
			<div className='flex min-h-screen items-center justify-center bg-gray-50'>
				<div className='text-center'>
					<p className='text-lg text-gray-900'>Redirecting to invoice payment page...</p>
					<meta httpEquiv='refresh' content={`0; url=${paymentUrl}`} />
				</div>
			</div>
		);
	}

	// Server-side request - fetch and render the invoice
	try {
		const invoice = await trpcCaller.getInvoiceByHandle({
			handle,
			invoiceId,
		});

		return (
			<div className='min-h-screen text-gray-900 print:min-h-0'>
				<div className='container mx-auto px-0 print:max-w-none'>
					<InvoiceRender
						invoice={invoice}
						workspace={invoice.workspace}
						client={invoice.client}
						isPreview={false}
						isPdfMode={true}
						className='print-optimized'
					/>
				</div>
			</div>
		);
	} catch (error) {
		console.error('Error fetching invoice for PDF:', error);
		notFound();
	}
}
