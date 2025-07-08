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

import type { FlowEdge, FlowNode, FlowState, SimpleEdge } from '@barely/validators';
import { raise } from '@barely/utils';

import { Button } from '@barely/ui/button';

import {
	BooleanEdgeType,
	SimpleEdgeType,
} from '~/app/[handle]/flows/[flowId]/_components/flow-builder-edges';
import {
	BooleanNodeType,
	EmptyNodeType,
	MailchimpAudienceNodeType,
	SendEmailFromTemplateGroupNodeType,
	SendEmailNodeType,
	TriggerNodeType,
	WaitNodeType,
} from '~/app/[handle]/flows/[flowId]/_components/flow-builder-nodes';
import { FlowEmailTemplateGroupModal } from '~/app/[handle]/flows/[flowId]/_components/flow-email-template-group-modal';
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
	onSelectionChange: state.onSelectionChange,
	onConnect: state.onConnect,
	// onNodesDelete: state.onNodesDelete,
	onLayout: state.onLayout,
	// setters
	replaceEmptyWithNode: state.replaceEmptyWithActionNode,
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
		setNodes,
		setEdges,
		//on
		onNodesChange,
		onEdgesChange,
		onConnect,
		onLayout,
		onSelectionChange,
	} = useFlowStore(useShallow(selector));

	const nodeTypes = {
		trigger: TriggerNodeType,
		empty: EmptyNodeType,
		wait: WaitNodeType,
		sendEmail: SendEmailNodeType,
		sendEmailFromTemplateGroup: SendEmailFromTemplateGroupNodeType,
		boolean: BooleanNodeType,
		addToMailchimpAudience: MailchimpAudienceNodeType,
	};

	const edgeTypes = {
		simple: SimpleEdgeType,
		boolean: BooleanEdgeType,
	};

	const onKeyDown = useCallback((event: KeyboardEvent) => {
		if (event.key === 'Delete' || event.key === 'Backspace') {
			event.preventDefault();
			return false;
		}
	}, []);

	useEffect(() => {
		document.addEventListener('keydown', onKeyDown);
		return () => {
			document.removeEventListener('keydown', onKeyDown);
		};
	}, [onKeyDown]);

	const onBeforeDelete = useCallback(
		async ({
			nodes: nodesToDelete,
			edges: edgesToDelete,
		}: {
			nodes: FlowNode[];
			edges: FlowEdge[];

			// eslint-disable-next-line @typescript-eslint/require-await
		}) => {
			console.log('onBeforeDelete', nodesToDelete, edgesToDelete);
			const booleanNodes = nodesToDelete.filter(node => node.type === 'boolean');
			if (booleanNodes.length > 0) {
				console.log('booleanNodes', booleanNodes);

				// we can handle some cases here
				// a) both are connected to an empty node

				// b) one endpoint is connected to an empty, but the other isn't. Then we just remove the boolean node and connect the boolean source to the non-empty target
				// c) both endpoints are connected to non-empty nodes. they musth confirm via window.confirm that they're OK with deleting everything under the boolean node

				if (booleanNodes.length > 1) {
					// not fucking around with multiple nodes that include a boolean atm
					return false;
				}

				const booleanNode = booleanNodes[0];

				console.log('booleanNode', booleanNode);

				if (!booleanNode) return false; // this should never happen

				console.log('nodes', nodes);
				console.log('edges', edges);

				const incomers = getIncomers(booleanNode, nodes, edges);
				const outgoers = getOutgoers(booleanNode, nodes, edges);
				const connectedEdges = getConnectedEdges([booleanNode], edges);

				console.log('incomers', incomers);
				console.log('outgoers', outgoers);
				console.log('connectedEdges', connectedEdges);

				// a) both are connected to an empty node ->
				// we delete the false outgoer node and the edge connected to it.
				// Our onNodesDelete will take care of connecting the boolean source to the true target
				if (outgoers.every(outgoer => outgoer.type === 'empty')) {
					// delete the false outgoer node and the edge connected to it.
					const newNodes = nodes.filter(node => {
						return node.id !== outgoers[0]?.id && node.id !== booleanNode.id;
					});

					const remainingEdges = edges.filter(edge => !connectedEdges.includes(edge));

					const createdEdge = {
						id: `${incomers[0]?.id}-${outgoers[1]?.id}`,
						source: incomers[0]?.id ?? raise('no source'),
						target: outgoers[1]?.id ?? raise('no target'),
						type: 'simple',
					} satisfies SimpleEdge;

					setNodes([...newNodes]);
					setEdges([...remainingEdges, createdEdge]);

					return false;
				}

				if (outgoers.some(outgoer => outgoer.type === 'empty')) {
					// b) one endpoint is connected to an empty, but the other isn't ->
					// we delete the empty node and edge connected to it.
					// Then we just remove the boolean node (our onNodesDelete will take care of connecting the boolean source to the non-empty target)

					const emptyNodeToDelete = outgoers.find(outgoer => outgoer.type === 'empty');
					const actionNodeToKeep = outgoers.find(outgoer => outgoer.type !== 'empty');
					const newNodes = nodes.filter(node => {
						return node.id !== emptyNodeToDelete?.id && node.id !== booleanNode.id;
					});

					const remainingEdges = edges.filter(edge => !connectedEdges.includes(edge));
					const createdEdge = {
						id: `${incomers[0]?.id}-${actionNodeToKeep?.id}`,
						source: incomers[0]?.id ?? raise('no source'),
						target: actionNodeToKeep?.id ?? raise('no target'),
						type: 'simple',
					} satisfies SimpleEdge;

					setNodes([...newNodes]);
					setEdges([...remainingEdges, createdEdge]);

					return false;
				}

				// c) both endpoints are connected to non-empty nodes. they must confirm via window.confirm that they're OK with deleting everything under the boolean node
				// const confirm = window.confirm('Are you sure you want to delete this boolean node?');
				const confirm = window.confirm(
					'This will delete everything under the boolean node. Are you sure you want to continue?',
				);
				if (!confirm) return false;

				return false; // todo: we have to delete everything under the boolean node
			}
			console.log('go ahead with deletion');
			return true;
		},
		[nodes, edges, setEdges, setNodes],
	);

	const onNodesDelete = useCallback(
		(deleted: FlowNode[]) => {
			console.log('deleted nodes', deleted);

			console.log('nodes in onNodesDelete', nodes);

			// console.log('deleted', deleted);
			// const deleteable = deleted.filter(n => n.type !== 'boolean');
			// console.log('deleteable', deleteable);

			// if (deleted.length > 0 && deleteable.length === 0) return;

			setNodes(nodes.filter(node => !deleted.includes(node)));

			const newEdges = deleted.reduce((acc, node) => {
				const incomers = getIncomers(node, nodes, edges);
				const outgoers = getOutgoers(node, nodes, edges);

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
		[edges, nodes, setEdges, setNodes, saveSnapshot],
	);

	const initialLayout = useRef(false);

	useEffect(() => {
		if (!nodes.length || !edges.length) return;

		if (!initialLayout.current) {
			initialLayout.current = true;
			setTimeout(() => {
				onLayout('TB');
			}, 1);
		}
	}, [nodes, edges, onLayout]);

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			// const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
			// const cmdKey = isMac ? event.metaKey : event.ctrlKey;

			if ((event.metaKey || event.ctrlKey) && !event.shiftKey && event.key === 'z') {
				event.preventDefault();
				undo();
			}

			if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key === 'z') {
				event.preventDefault();
				redo();
			}
		};

		document.addEventListener('keydown', handleKeyDown);
		return () => document.removeEventListener('keydown', handleKeyDown);
	}, [undo, redo]);

	return (
		<div className='h-[800px] w-full rounded-lg border border-border bg-background'>
			<ReactFlow
				nodes={nodes}
				edges={edges}
				onNodesChange={onNodesChange}
				onEdgesChange={onEdgesChange}
				onNodesDelete={onNodesDelete}
				onSelectionChange={onSelectionChange}
				onConnect={onConnect}
				nodeTypes={nodeTypes}
				edgeTypes={edgeTypes}
				panOnScroll={true}
				onBeforeDelete={onBeforeDelete}
				// delete
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
			<FlowEmailTemplateGroupModal />
			<FlowWaitModal />
			<FlowBooleanModal />
			<FlowTriggerModal />
			<FlowMailchimpAudienceModal />
		</div>
	);
}
