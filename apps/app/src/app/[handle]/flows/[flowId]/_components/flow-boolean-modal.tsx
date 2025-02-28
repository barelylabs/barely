import type { FlowState } from '@barely/lib/server/routes/flow/flow.ui.types';
import type { z } from 'zod';
import { useEffect } from 'react';
import { useCartFunnels } from '@barely/lib/hooks/use-cart-funnels';
// import { useProducts } from '@barely/lib/hooks/use-products';

import { useZodForm } from '@barely/lib/hooks/use-zod-form';
import { flowForm_booleanSchema } from '@barely/lib/server/routes/flow/flow.schema';
import { raise } from '@barely/lib/utils/raise';
import { useShallow } from 'zustand/react/shallow';

import { Modal, ModalBody, ModalFooter, ModalHeader } from '@barely/ui/elements/modal';
import { Form, SubmitButton } from '@barely/ui/forms';
import { NumberField } from '@barely/ui/forms/number-field';
import { SelectField } from '@barely/ui/forms/select-field';

import { useProducts } from '~/app/_hooks/use-products';
import { useFlowStore } from './flow-store';

const selector = (state: FlowState) => ({
	currentNode: state.currentNode,
	updateBooleanNode: state.updateBooleanNode,
	showBooleanModal: state.showBooleanModal,
	setShowBooleanModal: state.setShowBooleanModal,
});

const conditionOptions: {
	value: z.infer<typeof flowForm_booleanSchema>['booleanCondition'];
	label: string;
}[] = [
	{
		value: 'hasOrderedProduct',
		label: 'Ordered Product',
	},
	{
		value: 'hasOrderedCart',
		label: 'Ordered Cart',
	},
	{
		value: 'hasOrderedAmount',
		label: 'Ordered Amount',
	},
];

export function FlowBooleanModal() {
	const { currentNode, updateBooleanNode, showBooleanModal, setShowBooleanModal } =
		useFlowStore(useShallow(selector));

	const { productOptions } = useProducts();
	console.log('productOptions', productOptions);

	const { cartFunnelOptions } = useCartFunnels();

	const currentBooleanNode = currentNode?.type === 'boolean' ? currentNode : undefined; // : raise('No boolean node found');

	const form = useZodForm({
		schema: flowForm_booleanSchema,
		values: currentBooleanNode?.data,
		resetOptions: {
			keepDirtyValues: true,
		},
	});

	const handleSubmit = (data: z.infer<typeof flowForm_booleanSchema>) => {
		console.log(data);
		setShowBooleanModal(false);
		updateBooleanNode(currentBooleanNode?.id ?? raise('No boolean node found'), data);
		// form.reset();
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
							options={productOptions ?? []}
							control={form.control}
						/>
					: condition === 'hasOrderedCart' ?
						<SelectField
							name='cartFunnelId'
							label='Cart Funnel'
							options={cartFunnelOptions ?? []}
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
