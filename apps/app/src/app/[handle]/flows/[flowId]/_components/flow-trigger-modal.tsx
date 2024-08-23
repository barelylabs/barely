import type { z } from 'zod';
import { useMemo } from 'react';
import { useWorkspace } from '@barely/lib/hooks/use-workspace';
import { useZodForm } from '@barely/lib/hooks/use-zod-form';
import { api } from '@barely/lib/server/api/react';
import { updateFlowTriggerSchema } from '@barely/lib/server/routes/flow/flow.schema';
import { useShallow } from 'zustand/react/shallow';

import { Modal, ModalBody, ModalFooter, ModalHeader } from '@barely/ui/elements/modal';
import { Form, SubmitButton } from '@barely/ui/forms';
import { SelectField } from '@barely/ui/forms/select-field';

import type { FlowState } from '~/app/[handle]/flows/[flowId]/_react-flow/flow-types';
import { useFlowStore } from '~/app/[handle]/flows/[flowId]/_react-flow/flow-store';

const triggerFormSchema = updateFlowTriggerSchema.shape.data;

const conditionOptions: {
	value: z.infer<typeof updateFlowTriggerSchema>['data']['trigger'];
	label: string;
}[] = [
	{
		value: 'CALL_FLOW',
		label: 'Call Flow',
	},
	{
		value: 'NEW_FAN',
		label: 'New Fan',
	},
	{
		value: 'NEW_CART_ORDER',
		label: 'New Cart Order',
	},
];

const selector = (state: FlowState) => ({
	currentNode: state.currentNode,
	updateTriggerNode: state.updateTriggerNode,
	showTriggerModal: state.showTriggerModal,
	setShowTriggerModal: state.setShowTriggerModal,
});

export function FlowTriggerModal() {
	const { currentNode, updateTriggerNode, showTriggerModal, setShowTriggerModal } =
		useFlowStore(useShallow(selector));

	const currentTriggerNode = currentNode?.type === 'trigger' ? currentNode : null;

	const { handle } = useWorkspace();

	const { data: infiniteCartFunnels } = api.cartFunnel.byWorkspace.useInfiniteQuery(
		{
			handle,
		},
		{
			getNextPageParam: lastPage => lastPage.nextCursor,
		},
	);

	const cartFunnelOptions = useMemo(() => {
		const cartFunnels =
			infiniteCartFunnels?.pages.flatMap(page => page.cartFunnels) ?? [];
		return cartFunnels.map(funnel => ({
			value: funnel.id,
			label: funnel.name,
		}));
	}, [infiniteCartFunnels]);

	const form = useZodForm({
		schema: triggerFormSchema,
		values: currentTriggerNode?.data,
		resetOptions: {
			keepDirtyValues: true,
		},
	});

	const handleSubmit = async (values: z.infer<typeof triggerFormSchema>) => {
		if (!currentTriggerNode) return;
		setShowTriggerModal(false);
		updateTriggerNode(currentTriggerNode.id, values);
		form.reset();
	};

	return (
		<Modal
			showModal={showTriggerModal}
			setShowModal={setShowTriggerModal}
			onClose={() => setShowTriggerModal(false)}
			className='max-w-md'
		>
			<ModalHeader title='Edit Trigger' icon='trigger' />
			<Form form={form} onSubmit={handleSubmit}>
				<ModalBody>
					<SelectField
						name='trigger'
						label='Trigger'
						options={conditionOptions}
						control={form.control}
					/>

					{form.watch('trigger') === 'NEW_CART_ORDER' ?
						<SelectField
							name='cartFunnelId'
							label='Cart'
							options={cartFunnelOptions}
							control={form.control}
						/>
					:	null}
				</ModalBody>

				<ModalFooter>
					<SubmitButton fullWidth>Save</SubmitButton>
				</ModalFooter>
			</Form>
		</Modal>
	);
}
