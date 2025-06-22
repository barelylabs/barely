import type { z } from 'zod/v4';
import { redirect } from 'next/navigation';
import { api } from '@barely/lib/server/api/server';
import { emailDomainSearchParamsSchema } from '@barely/lib/server/routes/email-domain/email-domain.schema';

import { DashContentHeader } from '~/app/[handle]/_components/dash-content-header';
import { AllEmailDomains } from '~/app/[handle]/settings/email/domains/_components/all-email-domains';
import { CreateEmailDomainButton } from '~/app/[handle]/settings/email/domains/_components/create-email-domain-button';
import { CreateOrUpdateEmailDomainModal } from '~/app/[handle]/settings/email/domains/_components/create-or-update-email-domain-modal';
import { EmailDomainContextProvider } from '~/app/[handle]/settings/email/domains/_components/email-domain-context';
import { EmailDomainHotkeys } from '~/app/[handle]/settings/email/domains/_components/email-domain-hotkeys';

export default function EmailDomainsPage({
	params,
	searchParams,
}: {
	params: { handle: string };
	searchParams: z.infer<typeof emailDomainSearchParamsSchema>;
}) {
	const parsedSearchParams = emailDomainSearchParamsSchema.safeParse(searchParams);

	if (!parsedSearchParams.success) {
		console.error('parsedSearchParams error', parsedSearchParams.error);
		redirect(`/${params.handle}/settings/domains/email`);
	}

	const { selectedEmailDomainIds, ...filters } = parsedSearchParams.data;

	const emailDomains = api({ handle: params.handle }).emailDomain.byWorkspace({
		handle: params.handle,
		...filters,
	});

	return (
		<EmailDomainContextProvider
			initialEmailDomains={emailDomains}
			filters={filters}
			selectedEmailDomainIds={selectedEmailDomainIds ?? []}
		>
			<DashContentHeader
				title='Email domains'
				subtitle='Manage your email domains'
				button={<CreateEmailDomainButton />}
			/>
			<AllEmailDomains />

			<CreateOrUpdateEmailDomainModal mode='create' />
			<CreateOrUpdateEmailDomainModal mode='update' />

			<EmailDomainHotkeys />
		</EmailDomainContextProvider>
	);
}
