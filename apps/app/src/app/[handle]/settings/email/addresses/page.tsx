import type { z } from 'zod/v4';
import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { emailAddressSearchParamsSchema } from '@barely/validators';

import { DashContent } from '~/app/[handle]/_components/dash-content';
import { DashContentHeader } from '~/app/[handle]/_components/dash-content-header';
import { AllEmailAddresses } from '~/app/[handle]/settings/email/addresses/_components/all-email-addresses';
import { CreateEmailAddressButton } from '~/app/[handle]/settings/email/addresses/_components/create-email-address-button';
import { CreateEmailAddressModal } from '~/app/[handle]/settings/email/addresses/_components/create-email-address-modal';
import { EmailAddressHotkeys } from '~/app/[handle]/settings/email/addresses/_components/email-address-hotkeys';
import { UpdateEmailAddressModal } from '~/app/[handle]/settings/email/addresses/_components/update-email-address-modal';
import { HydrateClient } from '~/trpc/server';

export default async function EmailAddressesPage({
	params,
	searchParams,
}: {
	params: Promise<{ handle: string }>;
	searchParams: Promise<z.infer<typeof emailAddressSearchParamsSchema>>;
}) {
	const { handle } = await params;
	const filters = await searchParams;
	const parsedSearchParams = emailAddressSearchParamsSchema.safeParse(filters);

	if (!parsedSearchParams.success) {
		console.error('parsedSearchParams error', parsedSearchParams.error);
		redirect(`/${handle}/settings/email/addresses`);
	}

	return (
		<HydrateClient>
			<DashContentHeader
				title='Email Addresses'
				subtitle='Manage your email addresses'
				button={<CreateEmailAddressButton />}
			/>
			<DashContent>
				<Suspense>
					<AllEmailAddresses />

					<CreateEmailAddressModal />
					<UpdateEmailAddressModal />

					<EmailAddressHotkeys />
				</Suspense>
			</DashContent>
		</HydrateClient>
	);
}
