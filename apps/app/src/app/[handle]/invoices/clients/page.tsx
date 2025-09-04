import type { z } from 'zod/v4';
import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { invoiceClientSearchParamsSchema } from '@barely/validators';

import { DashContent } from '~/app/[handle]/_components/dash-content';
import { DashContentHeader } from '~/app/[handle]/_components/dash-content-header';
import { AllClients } from '~/app/[handle]/invoices/_components/all-clients';
import { ClientFilters } from '~/app/[handle]/invoices/_components/client-filters';
import { CreateClientButton } from '~/app/[handle]/invoices/_components/create-client-button';
import { CreateOrUpdateClientModal } from '~/app/[handle]/invoices/_components/create-or-update-client-modal';
import { HydrateClient, prefetch, trpc } from '~/trpc/server';

export default async function ClientsPage({
	params,
	searchParams,
}: {
	params: Promise<{ handle: string }>;
	searchParams: Promise<z.infer<typeof invoiceClientSearchParamsSchema>>;
}) {
	const awaitedParams = await params;
	const awaitedSearchParams = await searchParams;
	const parsedFilters = invoiceClientSearchParamsSchema.safeParse(awaitedSearchParams);
	if (!parsedFilters.success) {
		console.log(parsedFilters.error.flatten().fieldErrors);
		redirect(`/${awaitedParams.handle}/invoices/clients`);
	}

	// Prefetch data (not async - don't await)
	prefetch(
		trpc.invoiceClient.byWorkspace.infiniteQueryOptions({
			handle: awaitedParams.handle,
			...parsedFilters.data,
		}),
	);

	return (
		<HydrateClient>
			<DashContentHeader
				title='Clients'
				subtitle='Manage your invoice clients'
				button={<CreateClientButton />}
			/>
			<DashContent>
				<ClientFilters />
				<Suspense fallback={<div>Loading...</div>}>
					<AllClients />

					<CreateOrUpdateClientModal mode='create' />
					<CreateOrUpdateClientModal mode='update' />
				</Suspense>
			</DashContent>
		</HydrateClient>
	);
}
