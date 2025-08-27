import type { SelectFieldOption } from '@barely/ui/forms/select-field';
import type { FlowState } from '@barely/validators';
import type { z } from 'zod/v4';
import { useEffect } from 'react';
// import { useProducts } from '@barely/hooks';
import { useCartFunnels, useProducts, useZodForm } from '@barely/hooks';
import { raise } from '@barely/utils';
import { flowForm_booleanSchema } from '@barely/validators';
import { useShallow } from 'zustand/react/shallow';

import { Form, SubmitButton } from '@barely/ui/forms/form';
import { NumberField } from '@barely/ui/forms/number-field';
import { SelectField } from '@barely/ui/forms/select-field';
import { Modal, ModalBody, ModalFooter, ModalHeader } from '@barely/ui/modal';

import { useFlowStore } from './flow-store';

const selector = (state: FlowState) => ({
	currentNode: state.currentNode,
	updateBooleanNode: state.updateBooleanNode,
	showBooleanModal: state.showBooleanModal,
	setShowBooleanModal: state.setShowBooleanModal,
});

const conditionOptions = [
	{
		value: 'hasOrderedProduct' as const,
		label: 'Ordered Product',
	},
	{
		value: 'hasOrderedCart' as const,
		label: 'Ordered Cart',
	},
	{
		value: 'hasOrderedAmount' as const,
		label: 'Ordered Amount',
	},
] satisfies SelectFieldOption<
	NonNullable<z.infer<typeof flowForm_booleanSchema>['booleanCondition']>
>[];

export function FlowBooleanModal() {
	const { currentNode, updateBooleanNode, showBooleanModal, setShowBooleanModal } =
		useFlowStore(useShallow(selector));

	const { productOptions } = useProducts();

	const { cartFunnelOptions } = useCartFunnels();

	const currentBooleanNode = currentNode?.type === 'boolean' ? currentNode : undefined; // : raise('No boolean node found');

	const form = useZodForm({
		schema: flowForm_booleanSchema,
		values: currentBooleanNode?.data,
		resetOptions: { keepDirtyValues: true },
	});

	const handleSubmit = (data: z.infer<typeof flowForm_booleanSchema>) => {
		setShowBooleanModal(false);
		updateBooleanNode(currentBooleanNode?.id ?? raise('No boolean node found'), data);
	};

	useEffect(() => {
		if (currentBooleanNode?.data) {
			form.reset(currentBooleanNode.data);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [currentBooleanNode]);

	const condition = form.watch('booleanCondition');

	return (
		<Modal
			showModal={showBooleanModal}
			setShowModal={setShowBooleanModal}
			preventDefaultClose={form.formState.isDirty}
			onClose={() => setShowBooleanModal(false)}
			className='max-w-md'
		>
			<ModalHeader title='Update Decision' icon='branch' />
			<Form form={form} onSubmit={handleSubmit}>
				<ModalBody>
					<SelectField
						name='booleanCondition'
						label='Condition'
						options={conditionOptions}
						control={form.control}
					/>

					{condition === 'hasOrderedProduct' ?
						<SelectField
							name='productId'
							label='Product'
							options={productOptions}
							control={form.control}
						/>
					: condition === 'hasOrderedCart' ?
						<SelectField
							name='cartFunnelId'
							label='Cart Funnel'
							options={cartFunnelOptions}
							control={form.control}
						/>
					: condition === 'hasOrderedAmount' ?
						<NumberField
							name='totalOrderAmount'
							label='Total Order Amount'
							control={form.control}
						/>
					:	null}

					{/* {form.watch('condition') === 'HAS_ORDERED' && (
						<InputField name='orderId' label='Order ID' control={form.control} />
					)} */}
				</ModalBody>
				<ModalFooter>
					<SubmitButton fullWidth>Save</SubmitButton>
				</ModalFooter>
			</Form>
		</Modal>
	);
}
