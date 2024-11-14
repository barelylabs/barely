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
import { FanFilters } from '~/app/[handle]/fans/_components/fan-filters';
import { FanHotkeys } from '~/app/[handle]/fans/_components/fan-hotkeys';
import {
	ImportFansButton,
	ImportFansFromCsvModal,
} from '~/app/[handle]/fans/_components/import-fans-modal';

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
		<FanContextProvider initialFansFirstPage={fans}>
			<DashContentHeader
				title='Fans'
				button={
					<div className='flex flex-row gap-2'>
						<ImportFansButton />
						<CreateFanButton />
					</div>
				}
			/>
			<FanFilters />
			<AllFans />

			<CreateOrUpdateFanModal mode='create' />
			<CreateOrUpdateFanModal mode='update' />

			<ArchiveOrDeleteFanModal mode='archive' />
			<ArchiveOrDeleteFanModal mode='delete' />

			<ImportFansFromCsvModal />

			<FanHotkeys />
		</FanContextProvider>
	);
}
