import { DashContentHeader } from '~/app/[handle]/_components/dash-content-header';
import { CreateInvoiceForm } from '~/app/[handle]/invoices/_components/create-invoice-form';
import { HydrateClient } from '~/trpc/server';

export default async function NewInvoicePage({
	params,
}: {
	params: Promise<{ handle: string }>;
}) {
	const awaitedParams = await params;

	return (
		<HydrateClient>
			<DashContentHeader
				title='Create Invoice'
				subtitle='Fill in the details below to create a new invoice'
			/>

			<div className='mt-6'>
				<CreateInvoiceForm handle={awaitedParams.handle} />
			</div>
		</HydrateClient>
	);
}
