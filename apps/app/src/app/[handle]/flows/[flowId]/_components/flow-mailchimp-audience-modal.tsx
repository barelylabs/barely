import type { FlowState } from '@barely/validators';
import type { z } from 'zod/v4';
import { useWorkspace, useZodForm } from '@barely/hooks';
import { flowForm_addToMailchimpAudienceSchema } from '@barely/validators';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useShallow } from 'zustand/react/shallow';

import { useTRPC } from '@barely/api/app/trpc.react';

import { Form, SubmitButton } from '@barely/ui/forms/form';
import { SelectField } from '@barely/ui/forms/select-field';
import { Modal, ModalBody, ModalFooter, ModalHeader } from '@barely/ui/modal';

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

	const trpc = useTRPC();
	const { handle } = useWorkspace();

	const { data: mailchimpAudienceOptions } = useSuspenseQuery(
		trpc.mailchimp.audiencesByWorkspace.queryOptions(
			{ handle },
			{
				select: data =>
					data?.map(audience => ({
						label: audience.name,
						value: audience.id,
					})) ?? [],
			},
		),
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
						options={mailchimpAudienceOptions}
						value={form.watch('mailchimpAudienceId') ?? undefined}
					/>
				</ModalBody>
				<ModalFooter>
					<SubmitButton>Save</SubmitButton>
				</ModalFooter>
			</Form>
		</Modal>
	);
};
