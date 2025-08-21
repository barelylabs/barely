'use client';

import type { AppRouterOutputs } from '@barely/api/app/app.router';
import type { FlowState } from '@barely/validators';
import type { z } from 'zod/v4';
import { use, useState } from 'react';
import { useWorkspace, useZodForm } from '@barely/hooks';
import {
	getFlowActionFromActionNode,
	getFlowTriggerFromTriggerNode,
} from '@barely/lib/functions/flows/flow.utils';
import { formatDate, raise } from '@barely/utils';
import { updateFlowAndNodesSchema } from '@barely/validators';
import { useMutation, useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useShallow } from 'zustand/react/shallow';

import { useTRPC } from '@barely/api/app/trpc.react';

import { Button } from '@barely/ui/button';
import { Form, SubmitButton } from '@barely/ui/forms/form';
import { SelectField } from '@barely/ui/forms/select-field';
import { SwitchField } from '@barely/ui/forms/switch-field';
import { TextField } from '@barely/ui/forms/text-field';
import { Popover, PopoverContent, PopoverTrigger } from '@barely/ui/popover';
import { Separator } from '@barely/ui/separator';

import { useFlowStore } from './flow-store';

const selector = (state: FlowState) => ({
	nodes: state.nodes,
	edges: state.edges,
	isDirty: state.isDirty,
	setCurrentAsLastSaved: state.setCurrentAsLastSaved,
});

export function FlowUpdateForm(props: {
	initialFlow: Promise<AppRouterOutputs['flow']['byId']>;
}) {
	const trpc = useTRPC();
	const { handle } = useWorkspace();

	const initialFlow = use(props.initialFlow);
	const { nodes, edges, isDirty, setCurrentAsLastSaved } = useFlowStore(
		useShallow(selector),
	);

	const form = useZodForm({
		schema: updateFlowAndNodesSchema,
		values: {
			...initialFlow.flow,
			trigger: initialFlow.trigger,
			actions: initialFlow.actions,
			edges,
		},
		resetOptions: {
			keepDirtyValues: true,
		},
	});

	const isFormDirty = form.formState.isDirty || isDirty;

	const { data: fanOptions } = useSuspenseQuery(
		trpc.fan.byWorkspace.queryOptions(
			{ handle, limit: 20 },
			{
				select: data =>
					data.fans.map(fan => ({
						label: `${fan.fullName} - ${fan.email}`,
						value: fan.id,
					})),
			},
		),
	);

	const testFanId = form.watch('testFanId');
	const { data: cartOptions } = useQuery({
		...trpc.cartOrder.byWorkspace.queryOptions(
			{ handle, fanId: testFanId, limit: 20 },
			{
				select: data =>
					data.cartOrders.map(cart => ({
						label: `#${cart.orderId} - ${cart.funnel?.name} - ${formatDate(
							cart.createdAt.toISOString(),
						)}`,
						value: cart.id,
					})),
			},
		),
		enabled: !!testFanId,
	});

	const { mutateAsync: updateFlow } = useMutation(
		trpc.flow.update.mutationOptions({
			onSuccess: () => {
				setCurrentAsLastSaved();
				toast('Flow updated');
			},
		}),
	);

	const handleSubmit = async (data: z.infer<typeof updateFlowAndNodesSchema>) => {
		console.log('metadata', data);
		console.log('nodes', nodes);
		console.log('edges', edges);

		const currentTrigger =
			nodes.find(node => node.type === 'trigger') ?? raise('Flow must have a trigger');

		const updateTrigger = getFlowTriggerFromTriggerNode(
			currentTrigger,
			initialFlow.flow.id,
		) satisfies z.infer<typeof updateFlowAndNodesSchema>['trigger'];

		const updatedActions = nodes
			.filter(node => node.type !== 'trigger')
			.map(action =>
				getFlowActionFromActionNode(action, initialFlow.flow.id),
			) satisfies z.infer<typeof updateFlowAndNodesSchema>['actions'];

		const updateFlowAndNodesData = {
			...data,
			trigger: updateTrigger,
			actions: updatedActions,
			edges,
		} satisfies z.infer<typeof updateFlowAndNodesSchema>;

		const res = await updateFlow({
			...updateFlowAndNodesData,
			handle,
		});

		return console.log('res', res);
	};

	const { mutate: triggerTestFlow } = useMutation(
		trpc.flow.triggerTestFlow.mutationOptions({
			onSuccess: () => {
				setTestPopoverOpen(false);
				toast('Test flow triggered');
			},
			onError: error => {
				toast(error.message);
			},
		}),
	);
	const [testPopoverOpen, setTestPopoverOpen] = useState(false);

	const handleTriggerTestFlow = (data: z.infer<typeof updateFlowAndNodesSchema>) => {
		if (!data.testFanId) return toast('Please select a fan');

		const fan = fanOptions.find(fan => fan.value === data.testFanId);
		const cart = cartOptions?.find(cart => cart.value === data.testCartId);

		if (!fan) return toast('Please select a fan');

		if (data.trigger.type === 'newCartOrder') {
			if (!data.testCartId) return toast('Please select a cart');

			if (!cart) return toast('Please select a cart');
		}

		if (
			window.confirm(
				`This will initialize a flow run for {${fan.label} ${cart ? `- ${cart.label}` : ''}}. Are you sure you want to continue?`,
			)
		) {
			triggerTestFlow({
				handle,
				flowId: data.id,
				fanId: data.testFanId,
				cartId: data.testCartId,
			});
		}
	};

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
					<SubmitButton disabled={!isFormDirty} fullWidth>
						Save
					</SubmitButton>
					{/* {isDirty ? 'isDirty' : 'isNotDirty'}
					{isFormDirty ?
						<div className='text-xs italic text-yellow-600'>You have unsaved changes</div>
					:	<div className='text-xs italic text-gray-600'>No unsaved changes</div>} */}

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
										options={fanOptions}
									/>
									{form.watch('testFanId') && (
										<SelectField
											label='Select Cart'
											name='testCartId'
											control={form.control}
											options={cartOptions ?? []}
										/>
									)}
									<Button
										onClick={() => {
											const rawValues = form.getValues();
											const currentTrigger =
												nodes.find(node => node.type === 'trigger') ??
												raise('Flow must have a trigger');
											const updateTrigger = getFlowTriggerFromTriggerNode(
												currentTrigger,
												initialFlow.flow.id,
											);
											const updatedActions = nodes
												.filter(node => node.type !== 'trigger')
												.map(action =>
													getFlowActionFromActionNode(action, initialFlow.flow.id),
												);

											const formValues = {
												...rawValues,
												trigger: updateTrigger,
												actions: updatedActions,
												edges,
											} satisfies z.infer<typeof updateFlowAndNodesSchema>;

											handleTriggerTestFlow(formValues);
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
