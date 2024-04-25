'use client';

import type { z } from 'zod';
import { useCallback } from 'react';
import { useCreateOrUpdateForm } from '@barely/lib/hooks/use-create-or-update-form';
import { useWorkspace } from '@barely/lib/hooks/use-workspace';
import { api } from '@barely/lib/server/api/react';
import {
	defaultWorkflow,
	upsertWorkflowSchema,
} from '@barely/lib/server/routes/workflow/workflow.schema';

import { Modal, ModalBody, ModalHeader } from '@barely/ui/elements/modal';
import { Form } from '@barely/ui/forms';
import { TextField } from '@barely/ui/forms/text-field';

import { useWorkflowContext } from '~/app/[handle]/workflows/_components/workflow-context';

export function CreateOrUpdateWorkflowModal({ mode }: { mode: 'create' | 'update' }) {
	const apiUtils = api.useUtils();
	const workspace = useWorkspace();

	/* workflow context */
	const {
		lastSelectedWorkflow: selectedWorkflow,
		showCreateWorkflowModal,
		setShowCreateWorkflowModal,
		showUpdateWorkflowModal,
		setShowUpdateWorkflowModal,
		focusGridList,
	} = useWorkflowContext();

	/* cart funnels */
	const { data: cartFunnelsInfinite } = api.cartFunnel.byWorkspace.useInfiniteQuery(
		{
			handle: workspace.handle,
		},
		{
			getNextPageParam: lastPage => lastPage.nextCursor,
		},
	);

	const cartFunnels = cartFunnelsInfinite?.pages.flatMap(page => page.cartFunnels) ?? [];

	const cartFunnelOptions =
		cartFunnels.map(cartFunnel => ({
			label: cartFunnel.name,
			value: cartFunnel.id,
		})) ?? [];

	/* mutations */
	const { mutateAsync: createWorkflow } = api.workflow.create.useMutation({
		onSuccess: async () => {
			await handleCloseModal();
		},
	});

	const { mutateAsync: updateWorkflow } = api.workflow.update.useMutation({
		onSuccess: async () => {
			await handleCloseModal();
		},
	});

	/* form */
	const { form, onSubmit: onSubmitWorkflow } = useCreateOrUpdateForm({
		updateItem: selectedWorkflow ? selectedWorkflow : null,
		upsertSchema: upsertWorkflowSchema,
		defaultValues: defaultWorkflow,
		handleCreateItem: async d => {
			await createWorkflow(d);
		},
		handleUpdateItem: async d => {
			await updateWorkflow(d);
		},
	});

	const handleSubmit = useCallback(
		async (data: z.infer<typeof upsertWorkflowSchema>) => {
			await onSubmitWorkflow(data);
		},
		[onSubmitWorkflow],
	);

	/* modal */
	const showModal = mode === 'create' ? showCreateWorkflowModal : showUpdateWorkflowModal;
	const setShowModal =
		mode === 'create' ? setShowCreateWorkflowModal : setShowUpdateWorkflowModal;

	const handleCloseModal = useCallback(async () => {
		focusGridList();
		setShowModal(false);

		await apiUtils.workflow.invalidate();
	}, [apiUtils.workflow, setShowModal, focusGridList]);

	return (
		<Modal
			showModal={showModal}
			setShowModal={setShowModal}
			className='w-full'
			preventDefaultClose={form.formState.isDirty}
			onAutoFocus={() => form.setFocus('name')}
			onClose={handleCloseModal}
		>
			<ModalHeader
				icon='workflow'
				title={
					mode === 'create' ? 'Create Workflow' : (
						`Update ${selectedWorkflow?.name ?? 'Workflow'}`
					)
				}
			/>
			<Form form={form} onSubmit={handleSubmit}>
				<ModalBody>
					<TextField
						name='name'
						label='Name'
						placeholder='Enter workflow name'
						control={form.control}
						data-1p-ignore
						data-bwignore
						data-lpignore='true'
					/>
					<TextField
						name='description'
						label='Description'
						placeholder='Enter workflow description'
						control={form.control}
					/>

					{/* TRIGGERS */}

					{/* ACTIONS */}
				</ModalBody>
			</Form>
		</Modal>
	);
}
