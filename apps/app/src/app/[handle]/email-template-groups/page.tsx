import type { z } from 'zod/v4';
import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { emailTemplateGroupSearchParamsSchema } from '@barely/validators';

import { DashContentHeader } from '~/app/[handle]/_components/dash-content-header';
import { EmailTemplateGroupFilters } from '~/app/[handle]/email-template-groups/_components/email-template-group-filters';
import { HydrateClient, prefetch, trpc } from '~/trpc/server';
import { AllEmailTemplateGroups } from './_components/all-email-template-groups';
import { ArchiveOrDeleteEmailTemplateGroupModal } from './_components/archive-or-delete-email-template-group-modal';
import { CreateEmailTemplateGroupButton } from './_components/create-email-template-group-button';
import { CreateOrUpdateEmailTemplateGroupModal } from './_components/create-or-update-email-template-group-modal';
import { EmailTemplateGroupHotkeys } from './_components/email-template-group-hotkeys';

export default async function EmailTemplateGroupsPage({
	params,
	searchParams,
}: {
	params: Promise<{ handle: string }>;
	searchParams: Promise<z.infer<typeof emailTemplateGroupSearchParamsSchema>>;
}) {
	const awaitedParams = await params;
	const awaitedSearchParams = await searchParams;
	const parsedFilters =
		emailTemplateGroupSearchParamsSchema.safeParse(awaitedSearchParams);
	if (!parsedFilters.success) {
		console.log('parsedFilters error', parsedFilters.error);
		redirect(`/${awaitedParams.handle}/email-template-groups`);
	}

	prefetch(
		trpc.emailTemplateGroup.byWorkspace.infiniteQueryOptions({
			handle: awaitedParams.handle,
			...parsedFilters.data,
		}),
	);

	return (
		<HydrateClient>
			<Suspense fallback={<div>Loading...</div>}>
				<DashContentHeader
					title='Email Template Groups'
					button={<CreateEmailTemplateGroupButton />}
				/>

				<EmailTemplateGroupFilters />
				<AllEmailTemplateGroups />

				<CreateOrUpdateEmailTemplateGroupModal mode='create' />
				<CreateOrUpdateEmailTemplateGroupModal mode='update' />

				<ArchiveOrDeleteEmailTemplateGroupModal mode='archive' />
				<ArchiveOrDeleteEmailTemplateGroupModal mode='delete' />

				<EmailTemplateGroupHotkeys />
			</Suspense>
		</HydrateClient>
	);
}
