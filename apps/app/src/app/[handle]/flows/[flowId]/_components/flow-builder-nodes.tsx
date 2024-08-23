import { Handle, Position } from '@xyflow/react';
import { useShallow } from 'zustand/react/shallow';

import { Button } from '@barely/ui/elements/button';
import { Icon } from '@barely/ui/elements/icon';
import { Text } from '@barely/ui/elements/typography';

import type {
	BooleanNode,
	FlowState,
	SendEmailNode,
	TriggerNode,
	WaitNode,
} from '../_react-flow/flow-types';
import { useFlowStore } from '../_react-flow/flow-store';

const triggerStoreSelector = (state: FlowState) => ({
	setCurrentNode: state.setCurrentNode,
	setShowTriggerModal: state.setShowTriggerModal,
});

export function TriggerNodeType({ data, id }: { id: string; data: TriggerNode['data'] }) {
	const { setCurrentNode, setShowTriggerModal } = useFlowStore(
		useShallow(triggerStoreSelector),
	);
	return (
		<div className='relative flex items-center justify-center rounded border border-border bg-background p-2'>
			<div className='flex flex-col items-center gap-2'>
				<Text variant='md/bold'>Trigger</Text>
				<Text variant='xs/normal'>{data.trigger}</Text>
			</div>
			<Button
				look='ghost'
				size='2xs'
				variant='icon'
				startIcon='edit'
				onClick={() => {
					setCurrentNode(id);
					setShowTriggerModal(true);
				}}
				className='absolute right-1 top-1'
			/>
			<Handle type='source' position={Position.Bottom} />
		</div>
	);
}

const emptyStoreSelector = (state: FlowState) => ({
	replaceEmptyWithNode: state.replaceEmptyWithNode,
});

export function EmptyNodeType({ id }: { id: string }) {
	const { replaceEmptyWithNode } = useFlowStore(useShallow(emptyStoreSelector));

	return (
		<div className='flex items-center justify-center rounded border border-dashed border-border bg-background p-2'>
			<Handle type='target' position={Position.Top} />
			<div
				className='grid auto-cols-fr gap-2'
				style={{
					gridTemplateColumns: 'repeat(auto-fit, minmax(0, 1fr))',
					maxWidth: 'calc(4 * (24px + 0.5rem))',
				}}
			>
				<Button
					look='muted'
					size='sm'
					variant='icon'
					startIcon='wait'
					onClick={() => replaceEmptyWithNode(id, 'wait')}
				/>
				<Button
					look='muted'
					size='sm'
					variant='icon'
					startIcon='email'
					onClick={() => replaceEmptyWithNode(id, 'sendEmail')}
				/>
				<Button
					look='muted'
					size='sm'
					variant='icon'
					startIcon='branch'
					onClick={() => replaceEmptyWithNode(id, 'boolean')}
				/>
			</div>
		</div>
	);
}

const waitStoreSelector = (state: FlowState) => ({
	setCurrentNode: state.setCurrentNode,
	setShowWaitModal: state.setShowWaitModal,
});

export function WaitNodeType({ id, data }: { id: string; data: WaitNode['data'] }) {
	const { setCurrentNode, setShowWaitModal } = useFlowStore(
		useShallow(waitStoreSelector),
	);

	return (
		<div className='relative flex w-[172px] flex-col items-center justify-center rounded border border-border bg-background p-2 px-4'>
			<Handle type='target' position={Position.Top} />
			<div className='flex flex-col items-center gap-2'>
				<div className='flex flex-row items-center gap-1'>
					<Icon.wait className='h-[14px] w-[14px]' />
					<Text variant='md/bold'>Wait</Text>
				</div>
				<Text variant='xs/normal' className='text-center'>
					Wait for {data.duration} {data.units}
				</Text>
			</div>
			<Button
				look='ghost'
				size='2xs'
				variant='icon'
				startIcon='edit'
				onClick={() => {
					setCurrentNode(id);
					setShowWaitModal(true);
				}}
				className='absolute right-1 top-1'
			/>
			<Handle type='source' position={Position.Bottom} id={`${id}-bottom`} />
		</div>
	);
}

const sendEmailStoreSelector = (state: FlowState) => ({
	setCurrentNode: state.setCurrentNode,
	setShowEmailModal: state.setShowEmailModal,
});

export function SendEmailNodeType({
	id,
	data,
}: {
	id: string;
	data: SendEmailNode['data'];
}) {
	const { setCurrentNode, setShowEmailModal } = useFlowStore(
		useShallow(sendEmailStoreSelector),
	);

	return (
		<div className='relative flex flex-col items-center justify-center rounded border border-border bg-background p-2 px-8'>
			<Handle type='target' position={Position.Top} />
			<div className='flex flex-col items-center gap-2'>
				<div className='flex flex-row items-center gap-1'>
					<Icon.email className='h-[13px] w-[13px]' />
					<Text variant='md/bold'>Send Email</Text>
					<Text variant='sm/bold'>{data.email.subject}</Text>
				</div>
			</div>
			<Button
				look='minimal'
				size='2xs'
				variant='icon'
				startIcon='edit'
				onClick={() => {
					setCurrentNode(id);
					setShowEmailModal(true);
				}}
				className='absolute right-1 top-1'
			/>
			<Handle type='source' position={Position.Bottom} id={`${id}-bottom`} />
		</div>
	);
}

const booleanStoreSelector = (state: FlowState) => ({
	setCurrentNode: state.setCurrentNode,
	setShowBooleanModal: state.setShowBooleanModal,
});

export function BooleanNodeType({ id, data }: { id: string; data: BooleanNode['data'] }) {
	const { setCurrentNode, setShowBooleanModal } = useFlowStore(
		useShallow(booleanStoreSelector),
	);

	return (
		<div className='relative flex flex-col items-center justify-center rounded border border-border bg-background p-2 px-8'>
			<Handle type='target' position={Position.Top} />
			<div className='flex flex-col items-center gap-2'>
				<div className='flex flex-row items-center gap-1'>
					<Icon.branch className='h-[13px] w-[13px]' />
					<Text variant='md/bold'>Decision</Text>
				</div>
				<Text variant='xs/normal' className='text-center'>
					Condition: {data.condition}
				</Text>
			</div>
			<Button
				look='minimal'
				size='2xs'
				variant='icon'
				startIcon='edit'
				onClick={() => {
					setCurrentNode(id);
					setShowBooleanModal(true);
				}}
				className='absolute right-1 top-1'
			/>
			<Handle type='source' position={Position.Bottom} id={`${id}-bottom`} />
		</div>
	);
}
