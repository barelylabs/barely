import type { z } from 'zod';
import { useZodForm } from '@barely/lib/hooks/use-zod-form';
import { updateFlowAction_booleanSchema } from '@barely/lib/server/routes/flow/flow.schema';
import { raise } from '@barely/lib/utils/raise';
import { useShallow } from 'zustand/react/shallow';

import { Modal, ModalBody, ModalFooter, ModalHeader } from '@barely/ui/elements/modal';
import { Form, SubmitButton } from '@barely/ui/forms';
import { SelectField } from '@barely/ui/forms/select-field';

import type { FlowState } from '../_react-flow/flow-types';
import { useFlowStore } from '../_react-flow/flow-store';

const selector = (state: FlowState) => ({
	currentNode: state.currentNode,
	updateBooleanNode: state.updateBooleanNode,
	showBooleanModal: state.showBooleanModal,
	setShowBooleanModal: state.setShowBooleanModal,
});

const booleanFormSchema = updateFlowAction_booleanSchema.shape.data;

const conditionOptions: {
	value: z.infer<typeof updateFlowAction_booleanSchema>['data']['condition'];
	label: string;
}[] = [
	{
		value: 'HAS_ORDERED',
		label: 'Has Ordered',
	},
];

export function FlowBooleanModal() {
	// const [showModal, setShowModal] = useAtom(flowBooleanModalAtom);
	// const [nodeData, setNodeData] = useAtom(flowBooleanNodeDataAtom);

	const { currentNode, updateBooleanNode, showBooleanModal, setShowBooleanModal } =
		useFlowStore(useShallow(selector));

	const currentBooleanNode = currentNode?.type === 'boolean' ? currentNode : null;

	const form = useZodForm({
		schema: booleanFormSchema,
		values: currentBooleanNode?.data,
		resetOptions: {
			keepDirtyValues: true,
		},
	});

	const handleSubmit = (data: z.infer<typeof booleanFormSchema>) => {
		console.log(data);
		setShowBooleanModal(false);
		updateBooleanNode(currentBooleanNode?.id ?? raise('No boolean node found'), data);
		form.reset();
	};

	return (
		<Modal
			showModal={showBooleanModal}
			setShowModal={setShowBooleanModal}
			onClose={() => setShowBooleanModal(false)}
		>
			<ModalHeader title='Edit Boolean Condition' />
			<Form form={form} onSubmit={handleSubmit}>
				<ModalBody>
					<SelectField
						name='condition'
						label='Condition'
						options={conditionOptions}
						control={form.control}
					/>
				</ModalBody>
				<ModalFooter>
					<SubmitButton fullWidth>Save</SubmitButton>
				</ModalFooter>
			</Form>
			{/* <div className='space-y-4'>
				<div>
					<Text htmlFor='condition' variant='sm/normal'>
						Condition
					</Text>
					<Input
						id='condition'
						value={nodeData.condition}
						onChange={e =>
							setNodeData(prev => ({
								...prev!,
								condition: e.target.value,
							}))
						}
					/>
				</div>
				<Button onClick={handleSubmit}>Save</Button>
			</div> */}
		</Modal>
	);
}
