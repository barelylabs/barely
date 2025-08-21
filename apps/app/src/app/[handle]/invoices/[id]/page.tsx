import { notFound } from 'next/navigation';

import { DashContentHeader } from '~/app/[handle]/_components/dash-content-header';
import { InvoiceDetail } from '~/app/[handle]/invoices/_components/invoice-detail';
import { HydrateClient, trpc } from '~/trpc/server';

export default async function InvoiceDetailPage({
	params,
}: {
	params: Promise<{ handle: string; id: string }>;
}) {
	const awaitedParams = await params;

	// Prefetch invoice data
	const invoice = await trpc.invoice.byId({
		handle: awaitedParams.handle,
		id: awaitedParams.id,
	});

	if (!invoice) {
		notFound();
	}

	return (
		<HydrateClient>
			<DashContentHeader
				title={`Invoice ${invoice.invoiceNumber}`}
				subtitle={`Created on ${new Date(invoice.createdAt).toLocaleDateString()}`}
			/>

			<div className='mt-6'>
				<InvoiceDetail invoice={invoice} handle={awaitedParams.handle} />
			</div>
		</HydrateClient>
	);
}
