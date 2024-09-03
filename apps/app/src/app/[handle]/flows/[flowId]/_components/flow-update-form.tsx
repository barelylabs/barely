'use client';

import type { AppRouterOutputs } from '@barely/lib/server/api/router';
import type { FlowState } from '@barely/lib/server/routes/flow/flow.ui.types';
import type { z } from 'zod';
import { use } from 'react';
import { useToast } from '@barely/lib/hooks/use-toast';
import { useZodForm } from '@barely/lib/hooks/use-zod-form';
import { api } from '@barely/lib/server/api/react';
import { updateFlowAndNodesSchema } from '@barely/lib/server/routes/flow/flow.schema';
import {
	getFlowActionFromActionNode,
	getFlowTriggerFromTriggerNode,
} from '@barely/lib/server/routes/flow/flow.utils';
import { raise } from '@barely/lib/utils/raise';
import { useShallow } from 'zustand/react/shallow';

import { Form, SubmitButton } from '@barely/ui/forms';
import { TextField } from '@barely/ui/forms/text-field';

import { useFlowStore } from './flow-store';

const selector = (state: FlowState) => ({
	nodes: state.nodes,
	edges: state.edges,
});

export function FlowUpdateForm(props: {
	initialFlow: Promise<AppRouterOutputs['flow']['byId']>;
}) {
	const initialFlow = use(props.initialFlow);

	const { nodes, edges } = useFlowStore(useShallow(selector));

	const form = useZodForm({
		schema: updateFlowAndNodesSchema,
		values: {
			id: initialFlow.flow.id,
			name: initialFlow.flow.name,
			description: initialFlow.flow.description,
			trigger: initialFlow.trigger,
			actions: initialFlow.actions,
			edges,
		},
		resetOptions: {
			keepDirtyValues: true,
		},
	});

	const { toast } = useToast();

	const { mutateAsync: updateFlow } = api.flow.update.useMutation({
		onSuccess: () => {
			toast('Flow updated');
		},
	});

	const handleSubmit = async (data: z.infer<typeof updateFlowAndNodesSchema>) => {
		console.log('metadata', data);
		console.log('nodes', nodes);
		console.log('edges', edges);

		const currentTrigger =
			nodes.find(node => node.type === 'trigger') ?? raise('Flow must have a trigger');
		const updateTrigger: z.infer<typeof updateFlowAndNodesSchema>['trigger'] =
			getFlowTriggerFromTriggerNode(currentTrigger, initialFlow.flow.id);

		const updatedActions: z.infer<typeof updateFlowAndNodesSchema>['actions'] = nodes
			.filter(
				node =>
					node.type === 'boolean' ||
					node.type === 'empty' ||
					node.type === 'sendEmail' ||
					node.type === 'wait',
			)
			.map(action => getFlowActionFromActionNode(action, initialFlow.flow.id));

		console.log('updatedActions', updatedActions);

		const updateFlowAndNodesData: z.infer<typeof updateFlowAndNodesSchema> = {
			...data,
			trigger: updateTrigger,
			actions: updatedActions,
			edges,
		};

		const res = await updateFlow(updateFlowAndNodesData);

		return console.log('res', res);
	};

	return (
		<div className='flex w-full max-w-64 flex-col gap-4'>
			<Form form={form} onSubmit={handleSubmit}>
				<TextField
					name='name'
					label='Flow Name'
					control={form.control}
					placeholder='Flow Name'
				/>
				<TextField
					name='description'
					label='Description'
					control={form.control}
					placeholder='Flow Description'
				/>
				<SubmitButton fullWidth>Save</SubmitButton>
			</Form>
		</div>
	);
}
