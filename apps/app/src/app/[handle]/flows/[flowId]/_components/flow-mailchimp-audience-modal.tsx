import type { FlowState } from '@barely/lib/server/routes/flow/flow.ui.types';
import type { z } from 'zod';
import { useWorkspace } from '@barely/lib/hooks/use-workspace';
import { useZodForm } from '@barely/lib/hooks/use-zod-form';
import { api } from '@barely/lib/server/api/react';
import { flowForm_addToMailchimpAudienceSchema } from '@barely/lib/server/routes/flow/flow.schema';
import { useShallow } from 'zustand/react/shallow';

import { Modal, ModalBody, ModalFooter, ModalHeader } from '@barely/ui/elements/modal';
import { Form, SubmitButton } from '@barely/ui/forms';
import { SelectField } from '@barely/ui/forms/select-field';

import { useFlowStore } from '~/app/[handle]/flows/[flowId]/_components/flow-store';

const selector = (state: FlowState) => ({
	currentNode: state.currentNode,
	updateMailchimpAudienceNode: state.updateAddToMailchimpAudienceNode,
	showMailchimpAudienceModal: state.showMailchimpAudienceModal,
	setShowMailchimpAudienceModal: state.setShowMailchimpAudienceModal,
});

export const FlowMailchimpAudienceModal = () => {
	const {
		showMailchimpAudienceModal,
		setShowMailchimpAudienceModal,
		currentNode,
		updateMailchimpAudienceNode,
	} = useFlowStore(useShallow(selector));

	const currentMailchimpAudienceNode =
		currentNode?.type === 'addToMailchimpAudience' ? currentNode : null;

	const { handle } = useWorkspace();

	const { data: mailchimpAudienceOptions } = api.mailchimp.audiencesByWorkspace.useQuery(
		{ handle },
		{
			select: data =>
				data.map(audience => ({
					label: audience.name,
					value: audience.id,
				})),
		},
	);

	const form = useZodForm({
		schema: flowForm_addToMailchimpAudienceSchema,
		values: currentMailchimpAudienceNode?.data,
		resetOptions: {
			keepDirtyValues: true,
		},
	});

	const handleSubmit = (data: z.infer<typeof flowForm_addToMailchimpAudienceSchema>) => {
		setShowMailchimpAudienceModal(false);
		updateMailchimpAudienceNode(currentMailchimpAudienceNode?.id ?? '', data);
		form.reset();
	};

	return (
		<Modal
			showModal={showMailchimpAudienceModal}
			setShowModal={setShowMailchimpAudienceModal}
		>
			<ModalHeader icon='mailchimp' title='Edit Mailchimp Audience' />

			<Form form={form} onSubmit={handleSubmit}>
				<ModalBody>
					<SelectField
						control={form.control}
						name='mailchimpAudienceId'
						label='Audience'
						options={mailchimpAudienceOptions ?? []}
						value={form.watch('mailchimpAudienceId')}
					/>
				</ModalBody>
				<ModalFooter>
					<SubmitButton>Save</SubmitButton>
				</ModalFooter>
			</Form>
		</Modal>
	);
};
