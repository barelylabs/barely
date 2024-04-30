'use client';

import type { Workflow } from '@barely/lib/server/routes/workflow/workflow.schema';

import { NoResultsPlaceholder } from '@barely/ui/components/no-results-placeholder';
import { GridList, GridListCard } from '@barely/ui/elements/grid-list';
import { Text } from '@barely/ui/elements/typography';

import { CreateWorkflowButton } from '~/app/[handle]/workflows/_components/create-workflow-button';
import { useWorkflowContext } from '~/app/[handle]/workflows/_components/workflow-context';

export function AllWorkflows() {
	const {
		workflows,
		workflowSelection,
		setWorkflowSelection,
		gridListRef,
		setShowUpdateWorkflowModal,
	} = useWorkflowContext();

	return (
		<>
			<GridList
				glRef={gridListRef}
				aria-label='Workflows'
				className='flex flex-col gap-2'
				// behavior
				selectionMode='multiple'
				selectionBehavior='replace'
				// items
				items={workflows}
				selectedKeys={workflowSelection}
				setSelectedKeys={setWorkflowSelection}
				onAction={() => {
					if (!workflowSelection) return;
					setShowUpdateWorkflowModal(true);
				}}
				renderEmptyState={() => (
					<NoResultsPlaceholder
						icon='workflow'
						title='No workflows found.'
						subtitle='Create a workflow to get started.'
						button={<CreateWorkflowButton />}
					/>
				)}
			>
				{workflow => <WorkflowCard workflow={workflow} />}
			</GridList>
		</>
	);
}

function WorkflowCard({ workflow }: { workflow: Workflow }) {
	const {
		setShowUpdateWorkflowModal,
		setShowArchiveWorkflowModal,
		setShowDeleteWorkflowModal,
	} = useWorkflowContext();

	return (
		<GridListCard
			id={workflow.id}
			key={workflow.id}
			textValue={workflow.name}
			setShowUpdateModal={setShowUpdateWorkflowModal}
			setShowArchiveModal={setShowArchiveWorkflowModal}
			setShowDeleteModal={setShowDeleteWorkflowModal}
		>
			<Text>{workflow.name}</Text>
		</GridListCard>
	);
}
