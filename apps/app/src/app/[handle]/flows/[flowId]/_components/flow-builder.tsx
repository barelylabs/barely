'use client';

import { useCallback, useEffect, useRef } from 'react';
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

import type {
	FlowNode,
	FlowState,
	SimpleEdge,
} from '@barely/lib/server/routes/flow/flow.ui.types';

import { Button } from '@barely/ui/elements/button';

import {
	BooleanEdgeType,
	SimpleEdgeType,
} from '~/app/[handle]/flows/[flowId]/_components/flow-builder-edges';
import {
	BooleanNodeType,
	EmptyNodeType,
	MailchimpAudienceNodeType,
	SendEmailNodeType,
	TriggerNodeType,
	WaitNodeType,
} from '~/app/[handle]/flows/[flowId]/_components/flow-builder-nodes';
import { FlowMailchimpAudienceModal } from '~/app/[handle]/flows/[flowId]/_components/flow-mailchimp-audience-modal';
import { FlowBooleanModal } from './flow-boolean-modal';
import { FlowEmailModal } from './flow-email-modal';
import { useFlowStore } from './flow-store';
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
		undo,
		redo,
		saveSnapshot,
		// setters
		setEdges,
		//on
		onNodesChange,
		onEdgesChange,
		onConnect,
		onLayout,
	} = useFlowStore(useShallow(selector));

	const nodeTypes = {
		trigger: TriggerNodeType,
		empty: EmptyNodeType,
		wait: WaitNodeType,
		sendEmail: SendEmailNodeType,
		boolean: BooleanNodeType,
		addToMailchimpAudience: MailchimpAudienceNodeType,
	};

	const edgeTypes = {
		simple: SimpleEdgeType,
		boolean: BooleanEdgeType,
	};

	const onNodesDelete = useCallback(
		(deleted: FlowNode[]) => {
			const newEdges = deleted.reduce((acc, node) => {
				const incomers = getIncomers(node, nodes, edges);
				const outgoers = getOutgoers(node, nodes, edges);
				console.log('node', node);
				console.log('incomers', incomers);
				console.log('outgoers', outgoers);

				const connectedEdges = getConnectedEdges([node], edges);

				const remainingEdges = acc.filter(edge => !connectedEdges.includes(edge));

				const createdEdges = incomers.flatMap(({ id: source }) =>
					outgoers.map(({ id: target }) => {
						return {
							id: `${source}-${target}`,
							source,
							target,
							type: 'simple',
						} satisfies SimpleEdge;
					}),
				);

				console.log('createdEdges', createdEdges);

				return [...remainingEdges, ...createdEdges];
			}, edges);

			setEdges(newEdges);

			return saveSnapshot();
		},
		[edges, nodes, setEdges, saveSnapshot],
	);

	const initialLayout = useRef(false);

	useEffect(() => {
		if (!nodes || !edges || !onLayout) return;

		if (!initialLayout.current) {
			initialLayout.current = true;
			setTimeout(() => {
				onLayout('TB');
			}, 1);
		}
	}, [nodes, edges, onLayout]);

	return (
		<div className='h-[800px] w-full rounded-lg border border-border bg-background'>
			<ReactFlow
				nodes={nodes}
				edges={edges}
				onNodesChange={onNodesChange}
				onEdgesChange={onEdgesChange}
				onNodesDelete={onNodesDelete}
				onConnect={onConnect}
				nodeTypes={nodeTypes}
				edgeTypes={edgeTypes}
				panOnScroll={true}
			>
				<Controls />
				<Background />
			</ReactFlow>
			<div className='flex flex-row items-center gap-2'>
				<Button look='muted' size='sm' variant='icon' startIcon='undo' onClick={undo} />
				<Button look='muted' size='sm' variant='icon' startIcon='redo' onClick={redo} />
			</div>
			<div className='controls'>
				<button onClick={() => onLayout('TB')}>Vertical Layout</button>
				{/* <button onClick={() => onLayout('LR')}>Horizontal Layout</button> */}
			</div>
			<FlowEmailModal />
			<FlowWaitModal />
			<FlowBooleanModal />
			<FlowTriggerModal />
			<FlowMailchimpAudienceModal />
		</div>
	);
}
