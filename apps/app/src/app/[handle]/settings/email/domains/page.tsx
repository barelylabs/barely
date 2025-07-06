import type { z } from 'zod/v4';
import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { emailDomainSearchParamsSchema } from '@barely/validators';

import { DashContentHeader } from '~/app/[handle]/_components/dash-content-header';
import { AllEmailDomains } from '~/app/[handle]/settings/email/domains/_components/all-email-domains';
import { CreateEmailDomainButton } from '~/app/[handle]/settings/email/domains/_components/create-email-domain-button';
import { CreateOrUpdateEmailDomainModal } from '~/app/[handle]/settings/email/domains/_components/create-or-update-email-domain-modal';
import { EmailDomainHotkeys } from '~/app/[handle]/settings/email/domains/_components/email-domain-hotkeys';
import { HydrateClient } from '~/trpc/server';

export default async function EmailDomainsPage({
	params,
	searchParams,
}: {
	params: Promise<{ handle: string }>;
	searchParams: Promise<z.infer<typeof emailDomainSearchParamsSchema>>;
}) {
	const { handle } = await params;
	const filters = await searchParams;
	const parsedSearchParams = emailDomainSearchParamsSchema.safeParse(filters);

	if (!parsedSearchParams.success) {
		console.error('parsedSearchParams error', parsedSearchParams.error);
		redirect(`/${handle}/settings/domains/email`);
	}

	return (
		<HydrateClient>
			<Suspense>
				<DashContentHeader
					title='Email domains'
					subtitle='Manage your email domains'
					button={<CreateEmailDomainButton />}
				/>
				<AllEmailDomains />

				<CreateOrUpdateEmailDomainModal mode='create' />
				<CreateOrUpdateEmailDomainModal mode='update' />

				<EmailDomainHotkeys />
			</Suspense>
		</HydrateClient>
	);
}