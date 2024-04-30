'use client';

import { useModalHotKeys } from '@barely/lib/hooks/use-modal-hot-keys';

import { useWorkflowContext } from '~/app/[handle]/workflows/_components/workflow-context';

export function WorkflowHotkeys() {
	const {
		lastSelectedWorkflow,
		setShowCreateWorkflowModal,
		setShowUpdateWorkflowModal,
		setShowArchiveWorkflowModal,
		setShowDeleteWorkflowModal,
	} = useWorkflowContext();
	useModalHotKeys({
		setShowCreateModal: setShowCreateWorkflowModal,
		setShowUpdateModal: setShowUpdateWorkflowModal,
		setShowArchiveModal: setShowArchiveWorkflowModal,
		setShowDeleteModal: setShowDeleteWorkflowModal,
		itemSelected: lastSelectedWorkflow !== null,
	});
	return null;
}
