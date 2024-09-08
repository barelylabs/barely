'use client';

import type { AppRouterOutputs } from '@barely/lib/server/api/router';
import type { FlowState } from '@barely/lib/server/routes/flow/flow.ui.types';
import type { z } from 'zod';
import { use, useState } from 'react';
import { useToast } from '@barely/lib/hooks/use-toast';
import { useWorkspace } from '@barely/lib/hooks/use-workspace';
import { useZodForm } from '@barely/lib/hooks/use-zod-form';
import { api } from '@barely/lib/server/api/react';
import { updateFlowAndNodesSchema } from '@barely/lib/server/routes/flow/flow.schema';
import {
	getFlowActionFromActionNode,
	getFlowTriggerFromTriggerNode,
} from '@barely/lib/server/routes/flow/flow.utils';
import { raise } from '@barely/lib/utils/raise';
import { useShallow } from 'zustand/react/shallow';

import { Button } from '@barely/ui/elements/button';
import { Popover, PopoverContent, PopoverTrigger } from '@barely/ui/elements/popover';
import { Separator } from '@barely/ui/elements/separator';
import { Form, SubmitButton } from '@barely/ui/forms';
import { SelectField } from '@barely/ui/forms/select-field';
import { SwitchField } from '@barely/ui/forms/switch-field';
import { TextField } from '@barely/ui/forms/text-field';

import { useFlowStore } from './flow-store';

const selector = (state: FlowState) => ({
	nodes: state.nodes,
	edges: state.edges,
});

export function FlowUpdateForm(props: {
	initialFlow: Promise<AppRouterOutputs['flow']['byId']>;
}) {
	const { toast } = useToast();

	const initialFlow = use(props.initialFlow);
	const { nodes, edges } = useFlowStore(useShallow(selector));

	const form = useZodForm({
		schema: updateFlowAndNodesSchema,
		values: {
			...initialFlow.flow,
			// id: initialFlow.flow.id,
			// name: initialFlow.flow.name,
			// description: initialFlow.flow.description,
			trigger: initialFlow.trigger,
			actions: initialFlow.actions,
			edges,
		},
		resetOptions: {
			keepDirtyValues: true,
		},
	});

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
				node => node.type !== 'trigger',
				// node.type === 'boolean' ||
				// node.type === 'empty' ||
				// node.type === 'sendEmail' ||
				// node.type === 'wait',
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

	const { mutate: triggerTestFlow } = api.flow.triggerTestFlow.useMutation({
		onSuccess: () => {
			setTestPopoverOpen(false);
			toast('Test flow triggered');
		},
		onError: error => {
			toast(error.message);
		},
	});
	const [testPopoverOpen, setTestPopoverOpen] = useState(false);

	const handleTriggerTestFlow = (data: z.infer<typeof updateFlowAndNodesSchema>) => {
		if (!data.testFanId) return toast('Please select a fan');

		const fan = fanOptions?.find(fan => fan.value === data.testFanId);
		window.confirm(
			`This will initialize a flow run for {${fan?.label}}. Are you sure you want to continue?`,
		) &&
			triggerTestFlow({
				flowId: data.id,
				fanId: data.testFanId,
			});
	};

	const { handle } = useWorkspace();
	const { data: fanOptions } = api.fan.byWorkspace.useQuery(
		{ handle, limit: 20 },
		{
			select: data =>
				data.fans.map(fan => ({
					label: `${fan.fullName} - ${fan.email}`,
					value: fan.id,
				})),
		},
	);

	return (
		<div className='flex w-full max-w-64 flex-col gap-4'>
			<Form form={form} onSubmit={handleSubmit}>
				<div className='flex flex-col gap-4'>
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
					<SwitchField name='enabled' label='Enabled' control={form.control} />
					<SubmitButton fullWidth>Save</SubmitButton>

					<Separator className='my-4' />

					<div className='mb-4 flex w-full flex-row'>
						<Popover open={testPopoverOpen} onOpenChange={setTestPopoverOpen}>
							<PopoverTrigger asChild>
								<Button look='outline' fullWidth size='sm'>
									Trigger Test Flow
								</Button>
							</PopoverTrigger>
							<PopoverContent className='w-80'>
								<div className='space-y-4'>
									<h4 className='font-medium leading-none'>Trigger Test Flow</h4>
									<SelectField
										label='Select Fan'
										name='testFanId'
										control={form.control}
										options={fanOptions ?? []}
									/>
									<Button
										onClick={() => {
											handleTriggerTestFlow(form.getValues());
										}}
										fullWidth
									>
										Trigger Test Flow
									</Button>
								</div>
							</PopoverContent>
						</Popover>
					</div>
				</div>
			</Form>
		</div>
	);
}
