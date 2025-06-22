import type { z } from 'zod/v4';
import { redirect } from 'next/navigation';
import { api } from '@barely/lib/server/api/server';
import { emailTemplateGroupSearchParamsSchema } from '@barely/lib/server/routes/email-template-group/email-template-group.schema';

import { DashContentHeader } from '~/app/[handle]/_components/dash-content-header';
import { EmailTemplateGroupFilters } from '~/app/[handle]/email-template-groups/_components/email-template-group-filters';
import { AllEmailTemplateGroups } from './_components/all-email-template-groups';
import { ArchiveOrDeleteEmailTemplateGroupModal } from './_components/archive-or-delete-email-template-group-modal';
import { CreateEmailTemplateGroupButton } from './_components/create-email-template-group-button';
import { CreateOrUpdateEmailTemplateGroupModal } from './_components/create-or-update-email-template-group-modal';
import { EmailTemplateGroupContextProvider } from './_components/email-template-group-context';
import { EmailTemplateGroupHotkeys } from './_components/email-template-group-hotkeys';

export default function EmailTemplateGroupsPage({
	params,
	searchParams,
}: {
	params: { handle: string };
	searchParams: z.infer<typeof emailTemplateGroupSearchParamsSchema>;
}) {
	const parsedFilters = emailTemplateGroupSearchParamsSchema.safeParse(searchParams);
	if (!parsedFilters.success) {
		console.log('parsedFilters error', parsedFilters.error);
		redirect(`/${params.handle}/email-template-groups`);
	}

	const emailTemplateGroups = api({
		handle: params.handle,
	}).emailTemplateGroup.byWorkspace({
		handle: params.handle,
		...parsedFilters.data,
	});

	return (
		<EmailTemplateGroupContextProvider
			initialEmailTemplateGroupsFirstPage={emailTemplateGroups}
		>
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
		</EmailTemplateGroupContextProvider>
	);
}
