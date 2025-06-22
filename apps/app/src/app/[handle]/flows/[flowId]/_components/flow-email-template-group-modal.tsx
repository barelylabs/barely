'use client';

import type { FlowState } from '@barely/lib/server/routes/flow/flow.ui.types';
import type { z } from 'zod/v4';
import { useWorkspace } from '@barely/lib/hooks/use-workspace';
import { useZodForm } from '@barely/lib/hooks/use-zod-form';
import { api } from '@barely/lib/server/api/react';
import { flowForm_sendEmailFromTemplateGroupSchema } from '@barely/lib/server/routes/flow/flow.schema';
import { useShallow } from 'zustand/react/shallow';

import { Modal, ModalBody, ModalFooter, ModalHeader } from '@barely/ui/elements/modal';
import { Form, SubmitButton } from '@barely/ui/forms';
import { SelectField } from '@barely/ui/forms/select-field';

import { useFlowStore } from './flow-store';

export type FlowEmailTemplateGroupData = z.infer<
	typeof flowForm_sendEmailFromTemplateGroupSchema
>;

const selector = (state: FlowState) => ({
	currentNode: state.currentNode,
	updateEmailTemplateGroupNode: state.updateSendEmailFromTemplateGroupNode,
	showSendEmailTemplateGroupModal: state.showEmailFromTemplateGroupModal,
	setShowSendEmailTemplateGroupModal: state.setShowEmailFromTemplateGroupModal,
});

export const FlowEmailTemplateGroupModal = () => {
	const {
		showSendEmailTemplateGroupModal,
		setShowSendEmailTemplateGroupModal,
		currentNode,
		updateEmailTemplateGroupNode,
	} = useFlowStore(useShallow(selector));

	const currentEmailTemplateGroupNode =
		currentNode?.type === 'sendEmailFromTemplateGroup' ? currentNode : null;

	const { handle } = useWorkspace();

	const { data: emailTemplateGroupOptions } = api.emailTemplateGroup.byWorkspace.useQuery(
		{ handle },
		{
			select: data =>
				data.emailTemplateGroups.map(group => ({
					label: group.name,
					value: group.id,
				})),
		},
	);

	const form = useZodForm({
		schema: flowForm_sendEmailFromTemplateGroupSchema,
		values: currentEmailTemplateGroupNode?.data,
		resetOptions: {
			keepDirtyValues: true,
		},
	});

	const handleSubmit = (
		data: z.infer<typeof flowForm_sendEmailFromTemplateGroupSchema>,
	) => {
		console.log(data);
		setShowSendEmailTemplateGroupModal(false);
		updateEmailTemplateGroupNode(currentEmailTemplateGroupNode?.id ?? '', data);
		form.reset();
	};

	const preventDefaultClose = form.formState.isDirty;

	return (
		<Modal
			showModal={showSendEmailTemplateGroupModal}
			setShowModal={setShowSendEmailTemplateGroupModal}
			preventDefaultClose={preventDefaultClose}
		>
			<ModalHeader icon='email' title='Edit Email Template Group' />

			<Form form={form} onSubmit={handleSubmit}>
				<ModalBody>
					{/* <TextField
						label='Name'
						name='name'
						control={form.control}
						infoTooltip='The name of this node. This is just for your reference.'
					/> */}
					<SelectField
						label='Email Template Group'
						name='emailTemplateGroupId'
						control={form.control}
						options={emailTemplateGroupOptions ?? []}
					/>
				</ModalBody>
				<ModalFooter>
					<SubmitButton disabled={!form.formState.isDirty} fullWidth>
						Update
					</SubmitButton>
				</ModalFooter>
			</Form>
		</Modal>
	);
};
