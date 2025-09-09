import { DashContent } from '~/app/[handle]/_components/dash-content';
import { CreateInvoiceMultiStepForm } from '~/app/[handle]/invoices/_components/create-invoice-multi-step-form';
import { HydrateClient } from '~/trpc/server';

export default async function NewInvoicePage({
	params,
}: {
	params: Promise<{ handle: string }>;
}) {
	await params; // Just await to satisfy Next.js 15 requirements

	return (
		<HydrateClient>
			<DashContent>
				<CreateInvoiceMultiStepForm />
			</DashContent>
		</HydrateClient>
	);
}
