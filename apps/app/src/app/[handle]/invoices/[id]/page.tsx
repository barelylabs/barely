import { DashContent } from '~/app/[handle]/_components/dash-content';
import { DashContentHeader } from '~/app/[handle]/_components/dash-content-header';
import { InvoiceDetail } from '~/app/[handle]/invoices/_components/invoice-detail';
import { trpcCaller } from '~/trpc/server';

export default async function InvoiceDetailPage({
	params,
}: {
	params: Promise<{ handle: string; id: string }>;
}) {
	const awaitedParams = await params;

	// Prefetch invoice data
	const invoice = await trpcCaller.invoice.byId({
		handle: awaitedParams.handle,
		id: awaitedParams.id,
	});

	return (
		<>
			<DashContentHeader
				title={`Invoice ${invoice.invoiceNumber}`}
				subtitle={`Created on ${new Date(invoice.createdAt).toLocaleDateString()}`}
			/>
			<DashContent>
				<InvoiceDetail invoice={invoice} handle={awaitedParams.handle} />
			</DashContent>
		</>
	);
}
