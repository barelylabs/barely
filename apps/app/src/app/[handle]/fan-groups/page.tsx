import type { z } from 'zod/v4';
import { redirect } from 'next/navigation';
import { api } from '@barely/lib/server/api/server';
import { fanGroupSearchParamsSchema } from '@barely/lib/server/routes/fan-group/fan-group.schema';

import { DashContentHeader } from '~/app/[handle]/_components/dash-content-header';
import { AllFanGroups } from '~/app/[handle]/fan-groups/_components/all-fan-groups';
import { ArchiveOrDeleteFanGroupModal } from '~/app/[handle]/fan-groups/_components/archive-or-delete-fan-group-modal';
import { CreateFanGroupButton } from '~/app/[handle]/fan-groups/_components/create-fan-group-button';
import { CreateOrUpdateFanGroupModal } from '~/app/[handle]/fan-groups/_components/create-or-update-fan-group-modal';
import { FanGroupContextProvider } from '~/app/[handle]/fan-groups/_components/fan-group-context';
import { FanGroupFilters } from '~/app/[handle]/fan-groups/_components/fan-group-filters';
import { FanGroupHotkeys } from '~/app/[handle]/fan-groups/_components/fan-group-hotkeys';

export default function FanGroupsPage({
	params,
	searchParams,
}: {
	params: { handle: string };
	searchParams: z.infer<typeof fanGroupSearchParamsSchema>;
}) {
	const parsedFilters = fanGroupSearchParamsSchema.safeParse(searchParams);
	if (!parsedFilters.success) {
		console.log('parsedFilters error', parsedFilters.error);
		redirect(`/${params.handle}/fan-groups`);
	}

	const fanGroups = api({ handle: params.handle }).fanGroup.byWorkspace({
		handle: params.handle,
		...parsedFilters.data,
	});

	return (
		<FanGroupContextProvider initialFanGroups={fanGroups}>
			<DashContentHeader title='Fan Groups' button={<CreateFanGroupButton />} />
			<FanGroupFilters />
			<AllFanGroups />

			<CreateOrUpdateFanGroupModal mode='create' />
			<CreateOrUpdateFanGroupModal mode='update' />

			<ArchiveOrDeleteFanGroupModal mode='archive' />
			<ArchiveOrDeleteFanGroupModal mode='delete' />

			<FanGroupHotkeys />
		</FanGroupContextProvider>
	);
}
