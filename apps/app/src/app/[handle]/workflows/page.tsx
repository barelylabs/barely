import type { z } from 'zod';
import { redirect } from 'next/navigation';
import { api } from '@barely/lib/server/api/server';
import { workflowSearchParamsSchema } from '@barely/lib/server/routes/workflow/workflow.schema';

import { DashContentHeader } from '~/app/[handle]/_components/dash-content-header';
import { AllWorkflows } from '~/app/[handle]/workflows/_components/all-workflows';
import { ArchiveOrDeleteWorkflowModal } from '~/app/[handle]/workflows/_components/archive-or-delete-workflow-modal';
import { CreateOrUpdateWorkflowModal } from '~/app/[handle]/workflows/_components/create-or-update-workflow-modal';
import { CreateWorkflowButton } from '~/app/[handle]/workflows/_components/create-workflow-button';
import { WorkflowContextProvider } from '~/app/[handle]/workflows/_components/workflow-context';
import { WorkflowHotkeys } from '~/app/[handle]/workflows/_components/workflow-hotkeys';

export default function WorkflowsPage({
	params,
	searchParams,
}: {
	params: { handle: string };
	searchParams: z.infer<typeof workflowSearchParamsSchema>;
}) {
	const parsedFilters = workflowSearchParamsSchema.safeParse(searchParams);
	if (!parsedFilters.success) {
		redirect(`/${params.handle}/workflows`);
	}

	const { selectedWorkflowIds, ...filters } = parsedFilters.data;
	const workflows = api({ handle: params.handle }).workflow.byWorkspace({
		handle: params.handle,
		...filters,
	});

	return (
		<WorkflowContextProvider
			initialWorkflows={workflows}
			filters={filters}
			selectedWorkflowIds={selectedWorkflowIds ?? []}
		>
			<DashContentHeader title='Workflows' button={<CreateWorkflowButton />} />

			<AllWorkflows />

			<CreateOrUpdateWorkflowModal mode='create' />
			<CreateOrUpdateWorkflowModal mode='update' />

			<ArchiveOrDeleteWorkflowModal mode='archive' />
			<ArchiveOrDeleteWorkflowModal mode='delete' />

			<WorkflowHotkeys />
		</WorkflowContextProvider>
	);
}
