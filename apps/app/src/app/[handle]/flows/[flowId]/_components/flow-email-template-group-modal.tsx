'use client';

import type { FlowState } from '@barely/validators';
import type { z } from 'zod/v4';
import { useWorkspace, useZodForm } from '@barely/hooks';
import { flowForm_sendEmailFromTemplateGroupSchema } from '@barely/validators';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useShallow } from 'zustand/react/shallow';

import { useTRPC } from '@barely/api/app/trpc.react';

import { Form, SubmitButton } from '@barely/ui/forms/form';
import { SelectField } from '@barely/ui/forms/select-field';
import { Modal, ModalBody, ModalFooter, ModalHeader } from '@barely/ui/modal';

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

	const trpc = useTRPC();
	const { handle } = useWorkspace();

	const { data: emailTemplateGroupOptions } = useSuspenseQuery(
		trpc.emailTemplateGroup.byWorkspace.queryOptions(
			{ handle },
			{
				select: data =>
					data.emailTemplateGroups.map(group => ({
						label: group.name,
						value: group.id,
					})),
			},
		),
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
						options={emailTemplateGroupOptions}
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
