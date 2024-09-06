import type { z } from 'zod';
import { redirect } from 'next/navigation';
import { api } from '@barely/lib/server/api/server';
import { emailTemplateSearchParamsSchema } from '@barely/lib/server/routes/email-template/email-template.schema';

import { DashContentHeader } from '~/app/[handle]/_components/dash-content-header';
import { AllEmailTemplates } from '~/app/[handle]/email-templates/_components/all-email-templates';
import { ArchiveOrDeleteEmailTemplateModal } from './_components/archive-or-delete-email-template-modal';
import { CreateEmailTemplateButton } from './_components/create-email-template-button';
import { CreateOrUpdateEmailTemplateModal } from './_components/create-or-update-email-template-modal';
import { EmailTemplateContextProvider } from './_components/email-template-context';
import { EmailTemplateHotkeys } from './_components/email-template-hotkeys';

export default function EmailTemplatesPage({
	params,
	searchParams,
}: {
	params: { handle: string };
	searchParams: z.infer<typeof emailTemplateSearchParamsSchema>;
}) {
	const parsedFilters = emailTemplateSearchParamsSchema.safeParse(searchParams);
	if (!parsedFilters.success) {
		console.log('parsedFilters error', parsedFilters.error);
		redirect(`/${params.handle}/email-templates`);
	}

	const emailTemplates = api({ handle: params.handle }).emailTemplate.byWorkspace({
		handle: params.handle,
		...parsedFilters.data,
	});

	return (
		<EmailTemplateContextProvider initialEmailTemplatesFirstPage={emailTemplates}>
			<DashContentHeader title='Email Templates' button={<CreateEmailTemplateButton />} />
			<AllEmailTemplates />

			<CreateOrUpdateEmailTemplateModal mode='create' />
			<CreateOrUpdateEmailTemplateModal mode='update' />

			<ArchiveOrDeleteEmailTemplateModal mode='archive' />
			<ArchiveOrDeleteEmailTemplateModal mode='delete' />

			<EmailTemplateHotkeys />
		</EmailTemplateContextProvider>
	);
}
