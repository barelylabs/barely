import type { z } from 'zod';
import { redirect } from 'next/navigation';
import { api } from '@barely/lib/server/api/server';
import { fanSearchParamsSchema } from '@barely/lib/server/routes/fan/fan.schema';

import { DashContentHeader } from '~/app/[handle]/_components/dash-content-header';
import { AllFans } from '~/app/[handle]/fans/_components/all-fans';
import { ArchiveOrDeleteFanModal } from '~/app/[handle]/fans/_components/archive-or-delete-fan-modal';
import { CreateFanButton } from '~/app/[handle]/fans/_components/create-fan-button';
import { CreateOrUpdateFanModal } from '~/app/[handle]/fans/_components/create-or-update-fan-modal';
import { FanContextProvider } from '~/app/[handle]/fans/_components/fan-context';
import { FanHotkeys } from '~/app/[handle]/fans/_components/fan-hotkeys';

export default function FansPage({
	params,
	searchParams,
}: {
	params: { handle: string };
	searchParams: z.infer<typeof fanSearchParamsSchema>;
}) {
	const parsedFilters = fanSearchParamsSchema.safeParse(searchParams);
	if (!parsedFilters.success) {
		console.log('parsedFilters error', parsedFilters.error);
		redirect(`/${params.handle}/fans`);
	}

	const fans = api({ handle: params.handle }).fan.byWorkspace({
		handle: params.handle,
		...parsedFilters.data,
	});

	return (
		<FanContextProvider initialFans={fans}>
			<DashContentHeader title='Fans' button={<CreateFanButton />} />
			<AllFans />

			<CreateOrUpdateFanModal mode='create' />
			<CreateOrUpdateFanModal mode='update' />

			<ArchiveOrDeleteFanModal mode='archive' />
			<ArchiveOrDeleteFanModal mode='delete' />

			<FanHotkeys />
		</FanContextProvider>
	);
}
