import type { z } from 'zod/v4';
import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { log } from '@barely/lib/utils/log';
import { emailBroadcastSearchParamsSchema } from '@barely/validators';

import { DashContent } from '~/app/[handle]/_components/dash-content';
import { DashContentHeader } from '~/app/[handle]/_components/dash-content-header';
import { AllEmailBroadcasts } from '~/app/[handle]/email-broadcasts/_components/all-email-broadcasts';
import { CreateOrUpdateEmailBroadcastModal } from '~/app/[handle]/email-broadcasts/_components/create-or-update-email-broadcast-modal';
import { EmailBroadcastFilters } from '~/app/[handle]/email-broadcasts/_components/email-broadcast-filters';
import { HydrateClient, prefetch, trpc } from '~/trpc/server';
import { CreateEmailBroadcastButton } from './_components/create-email-broadcast-button';

export default async function EmailBroadcastsPage({
	params,
	searchParams,
}: {
	params: Promise<{ handle: string }>;
	searchParams: Promise<z.infer<typeof emailBroadcastSearchParamsSchema>>;
}) {
	const awaitedParams = await params;
	const awaitedSearchParams = await searchParams;
	const parsedFilters = emailBroadcastSearchParamsSchema.safeParse(awaitedSearchParams);
	if (!parsedFilters.success) {
		await log({
			message: `parsedFilters error, ${JSON.stringify(parsedFilters.error)}`,
			type: 'errors',
			location: 'EmailBroadcastsPage',
		});
		redirect(`/${awaitedParams.handle}/email-broadcasts`);
	}

	prefetch(
		trpc.emailBroadcast.byWorkspace.infiniteQueryOptions({
			handle: awaitedParams.handle,
			...parsedFilters.data,
		}),
	);

	return (
		<HydrateClient>
			<DashContentHeader
				title='Email Broadcasts'
				button={<CreateEmailBroadcastButton />}
			/>
			<DashContent>
				<Suspense fallback={<div>Loading...</div>}>
					<EmailBroadcastFilters />
					<AllEmailBroadcasts />

					<CreateOrUpdateEmailBroadcastModal mode='create' />
					<CreateOrUpdateEmailBroadcastModal mode='update' />

					{/* <ArchiveOrDeleteEmailBroadcastModal mode='archive' />
					<ArchiveOrDeleteEmailBroadcastModal mode='delete' /> */}
				</Suspense>
			</DashContent>
		</HydrateClient>
	);
}
