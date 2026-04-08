import { DashContent } from '~/app/[handle]/_components/dash-content';
import { DashContentHeader } from '~/app/[handle]/_components/dash-content-header';
import { CreateInvoiceMultiStepForm } from '~/app/[handle]/invoices/_components/create-invoice-multi-step-form';
import { HydrateClient } from '~/trpc/server';

export default async function NewInvoicePage({
	params,
}: {
	params: Promise<{ handle: string }>;
}) {
	const { handle } = await params;

	return (
		<HydrateClient>
			<DashContentHeader title='New Invoice' backHref={`/${handle}/invoices`} />
			<DashContent>
				<CreateInvoiceMultiStepForm />
			</DashContent>
		</HydrateClient>
	);
}
