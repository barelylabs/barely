import { redirect } from 'next/navigation';

import { DashContent } from '~/app/[handle]/_components/dash-content';
import { DashContentHeader } from '~/app/[handle]/_components/dash-content-header';
import { CreateInvoiceMultiStepForm } from '~/app/[handle]/invoices/_components/create-invoice-multi-step-form';
import { HydrateClient, trpcCaller } from '~/trpc/server';

export default async function EditInvoicePage({
	params,
}: {
	params: Promise<{ handle: string; id: string }>;
}) {
	const awaitedParams = await params;

	const invoice = await trpcCaller.invoice.byId({
		handle: awaitedParams.handle,
		id: awaitedParams.id,
	});

	// Only draft invoices can be edited
	if (invoice.status !== 'created') {
		redirect(`/${awaitedParams.handle}/invoices/${awaitedParams.id}`);
	}

	return (
		<HydrateClient>
			<DashContentHeader
				title={`Edit Invoice ${invoice.invoiceNumber}`}
				backHref={`/${awaitedParams.handle}/invoices/${awaitedParams.id}`}
			/>
			<DashContent>
				<CreateInvoiceMultiStepForm
					mode='edit'
					existingInvoice={{
						id: invoice.id,
						clientId: invoice.clientId,
						invoiceNumber: invoice.invoiceNumber,
						poNumber: invoice.poNumber,
						lineItems: invoice.lineItems,
						tax: invoice.tax,
						dueDate: invoice.dueDate,
						payerMemo: invoice.payerMemo,
						notes: invoice.notes,
						type: invoice.type,
						billingInterval: invoice.billingInterval,
						recurringDiscountPercent: invoice.recurringDiscountPercent,
						createdAt: invoice.createdAt,
					}}
				/>
			</DashContent>
		</HydrateClient>
	);
}
