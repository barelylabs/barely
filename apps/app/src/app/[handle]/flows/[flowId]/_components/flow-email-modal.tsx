'use client';

import type { z } from 'zod';
import { useZodForm } from '@barely/lib/hooks/use-zod-form';
import { updateFlowAction_sendEmailSchema } from '@barely/lib/server/routes/flow/flow.schema';
import { useShallow } from 'zustand/react/shallow';

import { Label } from '@barely/ui/elements/label';
import { MDXEditor } from '@barely/ui/elements/mdx-editor';
import { Modal, ModalBody, ModalFooter, ModalHeader } from '@barely/ui/elements/modal';
import { Form, SubmitButton } from '@barely/ui/forms';
import { TextField } from '@barely/ui/forms/text-field';

import type { FlowState } from '../_react-flow/flow-types';
import { useFlowStore } from '../_react-flow/flow-store';

export type FlowEmailData = z.infer<typeof updateFlowAction_sendEmailSchema>;

const selector = (state: FlowState) => ({
	currentNode: state.currentNode,
	updateEmailNode: state.updateSendEmailNode,
	showSendEmailModal: state.showEmailModal,
	setShowSendEmailModal: state.setShowEmailModal,
});

export const FlowEmailModal = () => {
	const { showSendEmailModal, setShowSendEmailModal, currentNode, updateEmailNode } =
		useFlowStore(useShallow(selector));

	const currentEmailNode = currentNode?.type === 'sendEmail' ? currentNode : null;

	/* form */
	const form = useZodForm({
		schema: updateFlowAction_sendEmailSchema,
		values:
			currentEmailNode?.data ?
				{
					id: currentEmailNode.id,
					email: currentEmailNode.data.email,
				}
			:	undefined,
		resetOptions: {
			keepDirtyValues: true, // retain user-interacted input
		},
	});

	const handleSubmit = (data: z.infer<typeof updateFlowAction_sendEmailSchema>) => {
		console.log(data);
		setShowSendEmailModal(false);
		updateEmailNode(currentEmailNode?.id ?? '', data);
		form.reset();
	};

	return (
		<Modal showModal={showSendEmailModal} setShowModal={setShowSendEmailModal}>
			<ModalHeader icon='email' title='Edit Email' />
			<Form form={form} onSubmit={handleSubmit}>
				<ModalBody>
					<TextField label='subject' name='email.subject' control={form.control} />
					{/* <TextField label='body' name='email.body' control={form.control} /> */}

					<Label>Body</Label>
					<MDXEditor
						markdown={currentEmailNode?.data.email.body ?? ''}
						onChange={markdown => {
							form.setValue('email.body', markdown);
						}}
					/>
				</ModalBody>
				<ModalFooter>
					<SubmitButton fullWidth>Update</SubmitButton>
				</ModalFooter>
			</Form>
		</Modal>
	);
};
