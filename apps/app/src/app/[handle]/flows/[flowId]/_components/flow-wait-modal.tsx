import type { FlowState } from '@barely/validators';
import type { z } from 'zod/v4';
import { useZodForm } from '@barely/hooks';
import { raise } from '@barely/utils';
import { flowForm_waitSchema } from '@barely/validators';
import { useShallow } from 'zustand/react/shallow';

import { Form, SubmitButton } from '@barely/ui/forms/form';
import { NumberField } from '@barely/ui/forms/number-field';
import { SelectField } from '@barely/ui/forms/select-field';
import { Modal, ModalHeader } from '@barely/ui/modal';

import { useFlowStore } from './flow-store';

const unitOptions: {
	value: z.infer<typeof flowForm_waitSchema>['waitForUnits'];
	label: string;
}[] = [
	{ value: 'minutes', label: 'Minutes' },
	{ value: 'hours', label: 'Hours' },
	{ value: 'days', label: 'Days' },
];

const selector = (state: FlowState) => ({
	currentNode: state.currentNode,
	updateWaitNode: state.updateWaitNode,
	showWaitModal: state.showWaitModal,
	setShowWaitModal: state.setShowWaitModal,
});

export const FlowWaitModal = () => {
	const { currentNode, updateWaitNode, showWaitModal, setShowWaitModal } = useFlowStore(
		useShallow(selector),
	);

	const currentWaitNode = currentNode?.type === 'wait' ? currentNode : undefined;

	const form = useZodForm({
		schema: flowForm_waitSchema,
		values: currentWaitNode?.data,
		resetOptions: {
			keepDirtyValues: true,
		},
	});

	const handleSubmit = (data: z.infer<typeof flowForm_waitSchema>) => {
		console.log(data);
		setShowWaitModal(false);
		updateWaitNode(currentWaitNode?.id ?? raise('No wait node found'), data);
		form.reset();
	};

	return (
		<Modal
			className='max-w-lg'
			showModal={showWaitModal}
			setShowModal={setShowWaitModal}
			preventDefaultClose={form.formState.isDirty}
		>
			<ModalHeader icon='wait' title='Edit Wait Time' />
			<Form form={form} onSubmit={handleSubmit}>
				<div className='space-y-4 p-4'>
					<NumberField label='Duration' name='waitFor' control={form.control} min={1} />
					<SelectField
						label='Units'
						name='waitForUnits'
						control={form.control}
						options={unitOptions}
						// options={unitOptions}
					/>
					<SubmitButton fullWidth>Update</SubmitButton>
				</div>
			</Form>
		</Modal>
	);
};
