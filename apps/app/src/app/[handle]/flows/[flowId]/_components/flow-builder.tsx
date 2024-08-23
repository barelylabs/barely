'use client';

import { useCallback } from 'react';
import {
	Background,
	Controls,
	getConnectedEdges,
	getIncomers,
	getOutgoers,
	ReactFlow,
} from '@xyflow/react';
import { useShallow } from 'zustand/react/shallow';

import '@xyflow/react/dist/style.css';

import { Button } from '@barely/ui/elements/button';

import type { FlowNode, FlowState } from '../_react-flow/flow-types';
import {
	BooleanNodeType,
	EmptyNodeType,
	SendEmailNodeType,
	TriggerNodeType,
	WaitNodeType,
} from '~/app/[handle]/flows/[flowId]/_components/flow-builder-nodes';
import { useFlowStore } from '../_react-flow/flow-store';
import { FlowBooleanModal } from './flow-boolean-modal';
import { FlowEmailModal } from './flow-email-modal';
import { FlowTriggerModal } from './flow-trigger-modal';
import { FlowWaitModal } from './flow-wait-modal';

const selector = (state: FlowState) => ({
	nodes: state.nodes,
	edges: state.edges,
	// currentNode: state.currentNode,
	history: state.history,
	undo: state.undo,
	redo: state.redo,
	saveSnapshot: state.saveSnapshot,
	// set
	setNodes: state.setNodes,
	setEdges: state.setEdges,
	setCurrentNode: state.setCurrentNode,
	// on
	onNodesChange: state.onNodesChange,
	onEdgesChange: state.onEdgesChange,
	onConnect: state.onConnect,
	// onNodesDelete: state.onNodesDelete,
	onLayout: state.onLayout,
	// setters
	replaceEmptyWithNode: state.replaceEmptyWithNode,
	//modals
	setShowWaitModal: state.setShowWaitModal,
	setShowEmailModal: state.setShowEmailModal,
	setShowBooleanModal: state.setShowBooleanModal,
	setShowTriggerModal: state.setShowTriggerModal,
});

export function FlowBuilder() {
	const {
		nodes,
		edges,
		// history
		// history,
		undo,
		redo,
		saveSnapshot,
		// setters
		setEdges,
		// setCurrentNode,
		// on
		onNodesChange,
		onEdgesChange,
		onConnect,
		// onNodesDelete,
		onLayout,
		// setters
		// replaceEmptyWithNode,
		// modals
		// setShowWaitModal,
		// setShowEmailModal,
		// setShowBooleanModal,
		// setShowTriggerModal,
	} = useFlowStore(useShallow(selector));

	const nodeTypes = {
		trigger: TriggerNodeType,
		empty: EmptyNodeType,
		wait: WaitNodeType,
		sendEmail: SendEmailNodeType,
		boolean: BooleanNodeType,
	};

	// const nodeTypes = useMemo(
	// 	() => ({
	// 		trigger: ({ data, id }: { id: string; data: TriggerNode['data'] }) => (
	// 			<div className='relative flex items-center justify-center rounded border border-border bg-background p-2'>
	// 				<div className='flex flex-col items-center gap-2'>
	// 					<Text variant='md/bold'>Trigger</Text>
	// 					<Text variant='xs/normal'>{data.trigger}</Text>
	// 				</div>
	// 				<Button
	// 					look='ghost'
	// 					size='2xs'
	// 					variant='icon'
	// 					startIcon='edit'
	// 					onClick={() => {
	// 						setCurrentNode(id);
	// 						setShowTriggerModal(true);
	// 					}}
	// 					className='absolute right-1 top-1'
	// 				/>
	// 				<Handle type='source' position={Position.Bottom} />
	// 			</div>
	// 		),

	// 		empty: ({ id }: { id: string }) => (
	// 			<div className='flex items-center justify-center rounded border border-dashed border-border bg-background p-2'>
	// 				<Handle type='target' position={Position.Top} />
	// 				<div
	// 					className='grid auto-cols-fr gap-2'
	// 					style={{
	// 						gridTemplateColumns: 'repeat(auto-fit, minmax(0, 1fr))',
	// 						maxWidth: 'calc(4 * (24px + 0.5rem))',
	// 					}}
	// 				>
	// 					<Button
	// 						look='muted'
	// 						size='sm'
	// 						variant='icon'
	// 						startIcon='wait'
	// 						onClick={() => replaceEmptyWithNode(id, 'wait')}
	// 					/>
	// 					<Button
	// 						look='muted'
	// 						size='sm'
	// 						variant='icon'
	// 						startIcon='email'
	// 						onClick={() => replaceEmptyWithNode(id, 'sendEmail')}
	// 					/>
	// 					<Button
	// 						look='muted'
	// 						size='sm'
	// 						variant='icon'
	// 						startIcon='branch'
	// 						onClick={() => replaceEmptyWithNode(id, 'boolean')}
	// 					/>
	// 				</div>
	// 			</div>
	// 		),

	// 		wait: ({ data, id }: { data: WaitNode['data']; id: string }) => (
	// 			<div className='relative flex w-[172px] flex-col items-center justify-center rounded border border-border bg-background p-2 px-4'>
	// 				<Handle type='target' position={Position.Top} />
	// 				<div className='flex flex-col items-center gap-2'>
	// 					<div className='flex flex-row items-center gap-1'>
	// 						<Icon.wait className='h-[14px] w-[14px]' />
	// 						<Text variant='md/bold'>Wait</Text>
	// 					</div>
	// 					<Text variant='xs/normal' className='text-center'>
	// 						Wait for {data.duration} {data.units}
	// 					</Text>
	// 				</div>
	// 				<Button
	// 					look='ghost'
	// 					size='2xs'
	// 					variant='icon'
	// 					startIcon='edit'
	// 					onClick={() => {
	// 						setCurrentNode(id);
	// 						setShowWaitModal(true);
	// 					}}
	// 					className='absolute right-1 top-1'
	// 				/>
	// 				<Handle type='source' position={Position.Bottom} id={`${id}-bottom`} />
	// 			</div>
	// 		),

	// 		sendEmail: ({ id }: { data: SendEmailNode['data']; id: string }) => (
	// 			<div className='relative flex flex-col items-center justify-center rounded border border-border bg-background p-2 px-8'>
	// 				<Handle type='target' position={Position.Top} />
	// 				<div className='flex flex-col items-center gap-2'>
	// 					<div className='flex flex-row items-center gap-1'>
	// 						<Icon.email className='h-[13px] w-[13px]' />
	// 						<Text variant='md/bold'>Send Email</Text>
	// 					</div>
	// 				</div>
	// 				<Button
	// 					look='minimal'
	// 					size='2xs'
	// 					variant='icon'
	// 					startIcon='edit'
	// 					onClick={() => {
	// 						setCurrentNode(id);
	// 						setShowEmailModal(true);
	// 					}}
	// 					className='absolute right-1 top-1'
	// 				/>
	// 				<Handle type='source' position={Position.Bottom} id={`${id}-bottom`} />
	// 			</div>
	// 		),

	// 		boolean: ({ data, id }: { data: BooleanNode['data']; id: string }) => (
	// 			<div className='relative flex flex-col items-center justify-center rounded border border-border bg-background p-2 px-8'>
	// 				<Handle type='target' position={Position.Top} />
	// 				<div className='flex flex-col items-center gap-2'>
	// 					<div className='flex flex-row items-center gap-1'>
	// 						<Icon.branch className='h-[13px] w-[13px]' />
	// 						<Text variant='md/bold'>Decision</Text>
	// 					</div>
	// 					<Text variant='xs/normal' className='text-center'>
	// 						Condition: {data.condition}
	// 					</Text>
	// 				</div>
	// 				<Button
	// 					look='minimal'
	// 					size='2xs'
	// 					variant='icon'
	// 					startIcon='edit'
	// 					onClick={() => {
	// 						setCurrentNode(id);
	// 						setShowBooleanModal(true);
	// 					}}
	// 					className='absolute right-1 top-1'
	// 				/>
	// 				<Handle type='source' position={Position.Bottom} id={`${id}-bottom`} />
	// 			</div>
	// 		),
	// 	}),
	// 	[
	// 		setCurrentNode,
	// 		setShowWaitModal,
	// 		setShowEmailModal,
	// 		setShowBooleanModal,
	// 		setShowTriggerModal,
	// 		replaceEmptyWithNode,
	// 	],
	// );

	const onNodesDelete = useCallback(
		(deleted: FlowNode[]) => {
			// console.log(deleted);
			// console.log(nodes);
			// console.log(edges);

			const newEdges = deleted.reduce((acc, node) => {
				const incomers = getIncomers(node, nodes, edges);
				const outgoers = getOutgoers(node, nodes, edges);
				console.log('node', node);
				console.log('incomers', incomers);
				console.log('outgoers', outgoers);

				const connectedEdges = getConnectedEdges([node], edges);

				const remainingEdges = acc.filter(edge => !connectedEdges.includes(edge));

				const createdEdges = incomers.flatMap(({ id: source }) =>
					outgoers.map(({ id: target }) => ({
						id: `${source}-${target}`,
						source,
						target,
					})),
				);

				console.log('createdEdges', createdEdges);

				return [...remainingEdges, ...createdEdges];
			}, edges);

			setEdges(newEdges);

			return saveSnapshot();
		},
		[edges, nodes, setEdges, saveSnapshot],
	);

	return (
		<div className='h-[800px] w-full rounded-lg border border-border'>
			<ReactFlow
				nodes={nodes}
				edges={edges}
				onNodesChange={onNodesChange}
				onEdgesChange={onEdgesChange}
				onNodesDelete={onNodesDelete}
				onConnect={onConnect}
				nodeTypes={nodeTypes}
				panOnScroll={true}
			>
				<Controls />
				<Background />
			</ReactFlow>
			<div className='flex flex-row items-center gap-2'>
				<Button look='muted' size='sm' variant='icon' startIcon='undo' onClick={undo} />
				<Button look='muted' size='sm' variant='icon' startIcon='redo' onClick={redo} />
			</div>
			{/* <p> {history.length}</p>
			<pre className='h-fit w-full'>{JSON.stringify(history, null, 2)}</pre> */}
			<div className='controls'>
				<button onClick={() => onLayout('TB')}>Vertical Layout</button>
				{/* <button onClick={() => onLayout('LR')}>Horizontal Layout</button> */}
			</div>
			<FlowEmailModal />
			<FlowWaitModal />
			<FlowBooleanModal />
			<FlowTriggerModal />
		</div>
	);
}
