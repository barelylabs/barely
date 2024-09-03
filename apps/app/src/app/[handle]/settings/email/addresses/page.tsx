import type { z } from 'zod';
import { redirect } from 'next/navigation';
import { api } from '@barely/lib/server/api/server';
import { emailAddressSearchParamsSchema } from '@barely/lib/server/routes/email-address/email-address.schema';

import { DashContentHeader } from '~/app/[handle]/_components/dash-content-header';
import { AllEmailAddresses } from '~/app/[handle]/settings/email/addresses/_components/all-email-addresses';
import { CreateEmailAddressButton } from '~/app/[handle]/settings/email/addresses/_components/create-email-address-button';
import { CreateEmailAddressModal } from '~/app/[handle]/settings/email/addresses/_components/create-email-address-modal';
import { EmailAddressContextProvider } from '~/app/[handle]/settings/email/addresses/_components/email-address-context';
import { EmailAddressHotkeys } from '~/app/[handle]/settings/email/addresses/_components/email-address-hotkeys';
import { UpdateEmailAddressModal } from '~/app/[handle]/settings/email/addresses/_components/update-email-address-modal';

export default function EmailAddressesPage({
	params,
	searchParams,
}: {
	params: { handle: string };
	searchParams: z.infer<typeof emailAddressSearchParamsSchema>;
}) {
	const parsedSearchParams = emailAddressSearchParamsSchema.safeParse(searchParams);

	if (!parsedSearchParams.success) {
		console.error('parsedSearchParams error', parsedSearchParams.error);
		redirect(`/${params.handle}/settings/email/addresses`);
	}

	const emailAddresses = api({ handle: params.handle }).emailAddress.byWorkspace({
		handle: params.handle,
		...parsedSearchParams.data,
	});

	return (
		<EmailAddressContextProvider initialEmailAddresses={emailAddresses}>
			<DashContentHeader
				title='Email Addresses'
				subtitle='Manage your email addresses'
				button={<CreateEmailAddressButton />}
			/>
			<AllEmailAddresses />

			<CreateEmailAddressModal />
			<UpdateEmailAddressModal />

			<EmailAddressHotkeys />
		</EmailAddressContextProvider>
	);
}
