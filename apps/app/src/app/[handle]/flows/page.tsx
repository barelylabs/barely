import type { z } from 'zod';
import { redirect } from 'next/navigation';
import { api } from '@barely/lib/server/api/server';
import { fmSearchParamsSchema } from '@barely/lib/server/routes/fm/fm.schema';

import { DashContentHeader } from '~/app/[handle]/_components/dash-content-header';
import { AllFlows } from '~/app/[handle]/flows/_components/all-flows';
import { CreateFlowButton } from '~/app/[handle]/flows/_components/create-flow-button';
import { FlowContextProvider } from '~/app/[handle]/flows/_components/flow-context';

export default function FlowsPage({
	params,
	searchParams,
}: {
	params: { handle: string };
	searchParams: z.infer<typeof fmSearchParamsSchema>;
}) {
	const parsedFilters = fmSearchParamsSchema.safeParse(searchParams);
	if (!parsedFilters.success) {
		console.log('parsedFilters error', parsedFilters.error);
		redirect(`/${params.handle}/flows`);
	}

	const flows = api({ handle: params.handle }).flow.byWorkspace({
		handle: params.handle,
		...parsedFilters.data,
	});

	return (
		<FlowContextProvider initialFlows={flows}>
			<DashContentHeader title='Flows' button={<CreateFlowButton />} />
			<AllFlows />
		</FlowContextProvider>
	);
}
