import type { z } from 'zod/v4';
import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { invoiceSearchParamsSchema } from '@barely/validators';

import { DashContentHeader } from '~/app/[handle]/_components/dash-content-header';
import { AllInvoices } from '~/app/[handle]/invoices/_components/all-invoices';
import { ArchiveOrDeleteInvoiceModal } from '~/app/[handle]/invoices/_components/archive-or-delete-invoice-modal';
import { CreateInvoiceButton } from '~/app/[handle]/invoices/_components/create-invoice-button';
import { InvoiceFilters } from '~/app/[handle]/invoices/_components/invoice-filters';
import { InvoiceHotkeys } from '~/app/[handle]/invoices/_components/invoice-hotkeys';
import { HydrateClient, prefetch, trpc } from '~/trpc/server';

export default async function InvoicesPage({
	params,
	searchParams,
}: {
	params: Promise<{ handle: string }>;
	searchParams: Promise<z.infer<typeof invoiceSearchParamsSchema>>;
}) {
	const awaitedParams = await params;
	const awaitedSearchParams = await searchParams;
	const parsedFilters = invoiceSearchParamsSchema.safeParse(awaitedSearchParams);
	if (!parsedFilters.success) {
		console.log(parsedFilters.error.flatten().fieldErrors);
		redirect(`/${awaitedParams.handle}/invoices`);
	}

	// Prefetch data (not async - don't await)
	prefetch(
		trpc.invoice.byWorkspace.infiniteQueryOptions({
			handle: awaitedParams.handle,
			...parsedFilters.data,
		}),
	);

	return (
		<HydrateClient>
			<DashContentHeader
				title='Invoices'
				button={<CreateInvoiceButton />}
				settingsHref={`/${awaitedParams.handle}/invoices/clients`}
			/>

			<InvoiceFilters />
			<Suspense fallback={<div>Loading...</div>}>
				<AllInvoices />

				<ArchiveOrDeleteInvoiceModal mode='archive' />
				<ArchiveOrDeleteInvoiceModal mode='delete' />

				<InvoiceHotkeys />
			</Suspense>
		</HydrateClient>
	);
}
