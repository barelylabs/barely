import type { z } from 'zod/v4';
import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { log } from '@barely/lib/utils/log';
import { emailTemplateSearchParamsSchema } from '@barely/validators';

import { GridListSkeleton } from '@barely/ui/components/grid-list-skeleton';

import { DashContent } from '~/app/[handle]/_components/dash-content';
import { DashContentHeader } from '~/app/[handle]/_components/dash-content-header';
import { HydrateClient, prefetch, trpc } from '~/trpc/server';
import { AllEmailTemplates } from './_components/all-email-templates';
import { ArchiveOrDeleteEmailTemplateModal } from './_components/archive-or-delete-email-template-modal';
import { CreateEmailTemplateButton } from './_components/create-email-template-button';
import { CreateOrUpdateEmailTemplateModal } from './_components/create-or-update-email-template-modal';
import { EmailTemplateFilters } from './_components/email-template-filters';
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
		await log({
			message: `parsedFilters error, ${JSON.stringify(parsedFilters.error)}`,
			type: 'errors',
			location: 'EmailTemplatesPage',
		});
		redirect(`/${awaitedParams.handle}/email/templates`);
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
			<DashContentHeader title='Email Templates' button={<CreateEmailTemplateButton />} />
			<DashContent>
				<EmailTemplateFilters />
				<Suspense fallback={<GridListSkeleton />}>
					<AllEmailTemplates />

					<CreateOrUpdateEmailTemplateModal mode='create' />
					<CreateOrUpdateEmailTemplateModal mode='update' />

					<ArchiveOrDeleteEmailTemplateModal mode='archive' />
					<ArchiveOrDeleteEmailTemplateModal mode='delete' />

					<EmailTemplateHotkeys />
				</Suspense>
			</DashContent>
		</HydrateClient>
	);
}
