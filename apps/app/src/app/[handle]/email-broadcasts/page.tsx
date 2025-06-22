import type { z } from 'zod/v4';
import { redirect } from 'next/navigation';
import { api } from '@barely/lib/server/api/server';
import { emailBroadcastSearchParamsSchema } from '@barely/lib/server/routes/email-broadcast/email-broadcast-schema';

import { DashContentHeader } from '~/app/[handle]/_components/dash-content-header';
import { AllEmailBroadcasts } from '~/app/[handle]/email-broadcasts/_components/all-email-broadcasts';
import { CreateOrUpdateEmailBroadcastModal } from '~/app/[handle]/email-broadcasts/_components/create-or-update-email-broadcast-modal';
import { EmailBroadcastFilters } from '~/app/[handle]/email-broadcasts/_components/email-broadcast-filters';
import { CreateEmailBroadcastButton } from './_components/create-email-broadcast-button';
import { EmailBroadcastsContextProvider } from './_components/email-broadcasts-context';

export default function EmailBroadcastsPage({
	params,
	searchParams,
}: {
	params: { handle: string };
	searchParams: z.infer<typeof emailBroadcastSearchParamsSchema>;
}) {
	const parsedFilters = emailBroadcastSearchParamsSchema.safeParse(searchParams);
	if (!parsedFilters.success) {
		console.log('parsedFilters error', parsedFilters.error);
		redirect(`/${params.handle}/email-broadcasts`);
	}

	const emailBroadcasts = api({ handle: params.handle }).emailBroadcast.byWorkspace({
		handle: params.handle,
		...parsedFilters.data,
	});

	return (
		<EmailBroadcastsContextProvider initialEmailBroadcastsFirstPage={emailBroadcasts}>
			<DashContentHeader
				title='Email Broadcasts'
				button={<CreateEmailBroadcastButton />}
			/>
			<EmailBroadcastFilters />
			<AllEmailBroadcasts />

			<CreateOrUpdateEmailBroadcastModal mode='create' />
			<CreateOrUpdateEmailBroadcastModal mode='update' />

			{/* <ArchiveOrDeleteEmailBroadcastModal mode='archive' />
			<ArchiveOrDeleteEmailBroadcastModal mode='delete' /> */}
		</EmailBroadcastsContextProvider>
	);
}
