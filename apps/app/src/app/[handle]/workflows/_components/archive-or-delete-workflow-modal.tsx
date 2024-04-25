'use client';

import { useCallback } from 'react';
import { api } from '@barely/lib/server/api/react';

import { ArchiveOrDeleteModal } from '~/app/[handle]/_components/archive-or-delete-modal';
import { useWorkflowContext } from '~/app/[handle]/workflows/workflow-context';

export function ArchiveOrDeleteWorkflowModal({ mode }: { mode: 'archive' | 'delete' }) {
	const {
		workflowSelection,
		lastSelectedWorkflow,

		showArchiveWorkflowModal,
		showDeleteWorkflowModal,
		setShowArchiveWorkflowModal,
		setShowDeleteWorkflowModal,
	} = useWorkflowContext();

	const apiUtils = api.useUtils();

	const showModal =
		mode === 'archive' ? showArchiveWorkflowModal : showDeleteWorkflowModal;
	const setShowModal =
		mode === 'archive' ? setShowArchiveWorkflowModal : setShowDeleteWorkflowModal;

	const onSuccess = useCallback(async () => {
		await apiUtils.workflow.invalidate();
		setShowModal(false);
	}, [apiUtils.workflow, setShowModal]);

	const { mutate: archiveWorkflows, isPending: isPendingArchive } =
		api.workflow.archive.useMutation({ onSuccess });
	const { mutate: deleteWorkflows, isPending: isPendingDelete } =
		api.workflow.delete.useMutation({ onSuccess });

	if (!lastSelectedWorkflow) return null;

	return (
		<ArchiveOrDeleteModal
			mode={mode}
			selection={workflowSelection}
			lastSelected={lastSelectedWorkflow}
			showModal={showModal}
			setShowModal={setShowModal}
			archiveItems={archiveWorkflows}
			deleteItems={deleteWorkflows}
			isPendingArchive={isPendingArchive}
			isPendingDelete={isPendingDelete}
			itemName='workflow'
		/>
	);
}
