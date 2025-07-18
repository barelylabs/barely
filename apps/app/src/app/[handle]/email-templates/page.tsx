import type { z } from 'zod/v4';
import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { emailTemplateSearchParamsSchema } from '@barely/validators';

import { DashContentHeader } from '~/app/[handle]/_components/dash-content-header';
import { AllEmailTemplates } from '~/app/[handle]/email-templates/_components/all-email-templates';
import { EmailTemplateFilters } from '~/app/[handle]/email-templates/_components/email-template-filters';
import { HydrateClient, prefetch, trpc } from '~/trpc/server';
import { ArchiveOrDeleteEmailTemplateModal } from './_components/archive-or-delete-email-template-modal';
import { CreateEmailTemplateButton } from './_components/create-email-template-button';
import { CreateOrUpdateEmailTemplateModal } from './_components/create-or-update-email-template-modal';
import { EmailTemplateHotkeys } from './_components/email-template-hotkeys';

export default async function EmailTemplatesPage({
	params,
	searchParams,
}: {
	params: Promise<{ handle: string }>;
	searchParams: Promise<z.infer<typeof emailTemplateSearchParamsSchema>>;
}) {
	const awaitedParams = await params;
	const awaitedSearchParams = await searchParams;
	const parsedFilters = emailTemplateSearchParamsSchema.safeParse(awaitedSearchParams);
	if (!parsedFilters.success) {
		console.log('parsedFilters error', parsedFilters.error);
		redirect(`/${awaitedParams.handle}/email-templates`);
	}

	prefetch(
		trpc.emailTemplate.byWorkspace.infiniteQueryOptions({
			handle: awaitedParams.handle,
			...parsedFilters.data,
		}),
	);

	prefetch(trpc.emailAddress.byWorkspace.queryOptions({ handle: awaitedParams.handle }));

	return (
		<HydrateClient>
			<Suspense fallback={<div>Loading...</div>}>
				<DashContentHeader
					title='Email Templates'
					button={<CreateEmailTemplateButton />}
				/>

				<EmailTemplateFilters />
				<AllEmailTemplates />

				<CreateOrUpdateEmailTemplateModal mode='create' />
				<CreateOrUpdateEmailTemplateModal mode='update' />

				<ArchiveOrDeleteEmailTemplateModal mode='archive' />
				<ArchiveOrDeleteEmailTemplateModal mode='delete' />

				<EmailTemplateHotkeys />
			</Suspense>
		</HydrateClient>
	);
}
