import type { z } from 'zod/v4';
import { redirect } from 'next/navigation';
import { api } from '@barely/lib/server/api/server';
import { emailTemplateSearchParamsSchema } from '@barely/lib/server/routes/email-template/email-template.schema';

import { DashContentHeader } from '~/app/[handle]/_components/dash-content-header';
import { AllEmailTemplates } from '~/app/[handle]/email-templates/_components/all-email-templates';
import { EmailTemplateFilters } from '~/app/[handle]/email-templates/_components/email-template-filters';
import { ArchiveOrDeleteEmailTemplateModal } from './_components/archive-or-delete-email-template-modal';
import { CreateEmailTemplateButton } from './_components/create-email-template-button';
import { CreateOrUpdateEmailTemplateModal } from './_components/create-or-update-email-template-modal';
import { EmailTemplateContextProvider } from './_components/email-template-context';
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

	const emailTemplates = api({ handle: awaitedParams.handle }).emailTemplate.byWorkspace({
		handle: awaitedParams.handle,
		...parsedFilters.data,
	});

	return (
		<EmailTemplateContextProvider initialEmailTemplatesFirstPage={emailTemplates}>
			<DashContentHeader title='Email Templates' button={<CreateEmailTemplateButton />} />

			<EmailTemplateFilters />
			<AllEmailTemplates />

			<CreateOrUpdateEmailTemplateModal mode='create' />
			<CreateOrUpdateEmailTemplateModal mode='update' />

			<ArchiveOrDeleteEmailTemplateModal mode='archive' />
			<ArchiveOrDeleteEmailTemplateModal mode='delete' />

			<EmailTemplateHotkeys />
		</EmailTemplateContextProvider>
	);
}
