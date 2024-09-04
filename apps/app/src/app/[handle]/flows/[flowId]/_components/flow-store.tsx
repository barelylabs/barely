'use client';

/* refs: 
https://tkdodo.eu/blog/zustand-and-react-context
https://gist.github.com/bryanltobing/e09cb4bb110c4d10cefde665b572d899#file-viewmodelzustand-tsx-L22-L27
*/
import type { AppRouterOutputs } from '@barely/lib/server/api/router';
import type {
	AddToMailchimpAudienceNode,
	BooleanEdge,
	BooleanNode,
	EmptyNode,
	FlowNode,
	FlowState,
	SendEmailNode,
	SimpleEdge,
	TriggerNode,
	WaitNode,
} from '@barely/lib/server/routes/flow/flow.ui.types';
import type { StoreApi } from 'zustand';
import { createContext, use, useContext, useState } from 'react';
import { useToast } from '@barely/lib/hooks/use-toast';
import { getFlowLayout } from '@barely/lib/server/routes/flow/flow.layout';
import {
	getDefaultFlowAction_addToMailchimpAudience,
	getDefaultFlowAction_boolean,
	getDefaultFlowAction_empty,
	getDefaultFlowAction_sendEmail,
	getDefaultFlowAction_wait,
} from '@barely/lib/server/routes/flow/flow.utils';
import { newId } from '@barely/lib/utils/id';
import { raise } from '@barely/lib/utils/raise';
// import dagre from '@dagrejs/dagre';
import { addEdge, applyEdgeChanges, applyNodeChanges } from '@xyflow/react';
import { createStore, useStore } from 'zustand';

const FlowStoreContext = createContext<StoreApi<FlowState> | null>(null);

export const FlowStoreProvider = ({
	children,
	initialFlow,
	defaultEmailAddress,
	initialDefaultMailchimpAudienceId,
}: {
	children: React.ReactNode;
	initialFlow: Promise<AppRouterOutputs['flow']['byId']>;
	defaultEmailAddress: Promise<AppRouterOutputs['emailAddress']['default']>;
	initialDefaultMailchimpAudienceId: Promise<
		AppRouterOutputs['mailchimp']['defaultAudience']
	>;
}) => {
	const initialData = use(initialFlow);
	const defaultFromEmail = use(defaultEmailAddress);
	const defaultMailchimpAudienceId = use(initialDefaultMailchimpAudienceId);
	const flowId = initialData.flow.id;

	const { toast } = useToast();

	const [flowStore] = useState(() =>
		createStore<FlowState>((set, get) => ({
			nodes: initialData.uiNodes ?? [],
			edges: initialData.uiEdges ?? [],
			currentNode: null,

			// history
			history: [],
			historyIndex: -1,
			saveSnapshot: () => {
				const currentState = {
					nodes: get().nodes,
					edges: get().edges,
				};
				console.log('saving snapshot', currentState);
				const historyIndex = get().historyIndex;
				set({
					history: [...get().history.slice(0, historyIndex + 1), currentState],
					historyIndex: historyIndex + 1,
				});
			},
			undo: () => {
				const historyIndex = get().historyIndex;
				if (historyIndex <= 0) return;
				const history = get().history;
				const nodes = history[historyIndex - 1]?.nodes;
				const edges = history[historyIndex - 1]?.edges;
				if (!nodes || !edges) return;
				set({
					nodes,
					edges,
					historyIndex: historyIndex - 1,
				});
				return setTimeout(() => {
					get().onLayout('TB');
				}, 0);
			},
			redo: () => {
				const historyIndex = get().historyIndex;
				const history = get().history;
				const nodes = history[historyIndex + 1]?.nodes;
				const edges = history[historyIndex + 1]?.edges;
				if (!nodes || !edges) return;
				set({
					nodes,
					edges,
					historyIndex: historyIndex + 1,
				});
				return setTimeout(() => {
					get().onLayout('TB');
				}, 0);
			},

			onNodesChange: changes => {
				set({
					nodes: applyNodeChanges(changes, get().nodes),
				});
			},

			onEdgesChange: changes => {
				set({
					edges: applyEdgeChanges(changes, get().edges),
				});
			},

			onConnect: connection => {
				set({
					edges: addEdge(connection, get().edges),
				});
			},

			setCurrentNode: (id: string) => {
				const node = get().nodes.find(node => node.id === id);
				set({ currentNode: node });
			},

			setNodes: nodes => {
				console.log('setting nodes', nodes);
				set({ nodes });
			},

			setEdges: edges => {
				set({ edges });
			},

			replaceEmptyWithNode: (id: string, type: FlowNode['type']) => {
				const spacing = { x: 0, y: 100 }; // Horizontal and vertical spacing

				const prevNodes = get().nodes;
				const replacedNodeIndex = prevNodes.findIndex(node => node.id === id);
				const replacedNode = prevNodes[replacedNodeIndex];

				if (!replacedNode) {
					console.error('Node not found');
					return set({ nodes: prevNodes });
				}

				// calculate the new position
				const emptyNodeX = replacedNode.position.x;
				const emptyNodeWidth = replacedNode.measured?.width ?? 0;
				const emptyNodeY = replacedNode.position.y;

				// fixme: this is hacky. we should hardcode widths
				const newNodeWidth =
					type === 'boolean' ?
						prevNodes.find(node => node.type === 'boolean')?.measured?.width ?? 0
					: type === 'wait' ?
						prevNodes.find(node => node.type === 'wait')?.measured?.width ?? 0
					: type === 'sendEmail' ?
						prevNodes.find(node => node.type === 'sendEmail')?.measured?.width ?? 0
					:	0;

				const newNodeX = emptyNodeX + (emptyNodeWidth - newNodeWidth) / 2;

				const updatedNodes = prevNodes.map((node, index) => {
					if (index === replacedNodeIndex) {
						// const newNodeId = get().nodes.length.toString();
						if (type === 'boolean') {
							const { flowActionNode } = getDefaultFlowAction_boolean({
								flowId,
								id,
								position: { x: newNodeX, y: emptyNodeY },
							});

							return flowActionNode;
						} else if (type === 'wait') {
							const { flowActionNode } = getDefaultFlowAction_wait({
								flowId,
								id,
								position: { x: newNodeX, y: emptyNodeY },
							});
							return flowActionNode;
						} else if (type === 'sendEmail') {
							const emailFromId = defaultFromEmail?.id;

							if (!emailFromId) {
								toast('No default email address');
								raise('No default email address');
							}

							const { flowActionNode } = getDefaultFlowAction_sendEmail({
								flowId,
								id,
								emailFromId: defaultFromEmail?.id ?? raise('No default email address'),
								position: { x: newNodeX, y: emptyNodeY },
							});
							return flowActionNode;
						} else if (type === 'addToMailchimpAudience') {
							const { flowActionNode } = getDefaultFlowAction_addToMailchimpAudience({
								flowId,
								id,
								position: { x: newNodeX, y: emptyNodeY },
								defaultMailchimpAudienceId:
									defaultMailchimpAudienceId ?? raise('No default mailchimp audience id'),
							});
							return flowActionNode;
						}
					} else if (index > replacedNodeIndex) {
						return {
							...node,
							position: { ...node.position, y: node.position.y + spacing.y },
						};
					}
					return node;
				});

				const newEmptyNodeY = emptyNodeY + spacing.y;

				if (type === 'boolean') {
					const { flowActionNode: newTrueNode } = getDefaultFlowAction_empty({
						flowId,
						position: { x: newNodeX - spacing.x / 2, y: newEmptyNodeY },
					});

					const { flowActionNode: newFalseNode } = getDefaultFlowAction_empty({
						flowId,
						position: { x: newNodeX + spacing.x / 2, y: newEmptyNodeY },
					});

					updatedNodes.push(newTrueNode, newFalseNode);

					set({ nodes: updatedNodes });

					const updatedEdges = get().edges.filter(edge => edge.source !== id);

					updatedEdges.push(
						{
							id: `e-${id}-${newTrueNode.id}`,
							type: 'boolean',
							data: {
								boolean: true,
							},
							source: id,
							target: newTrueNode.id,
							deletable: false,
						} satisfies BooleanEdge,
						{
							id: `e-${id}-${newFalseNode.id}`,
							type: 'boolean',
							data: {
								boolean: false,
							},
							source: id,
							target: newFalseNode.id,
							deletable: false,
						} satisfies BooleanEdge,
					);

					set({ edges: updatedEdges });
				} else {
					const newNode: EmptyNode = {
						id: newId('flowAction'),
						type: 'empty',
						deletable: false,
						position: { x: newNodeX, y: newEmptyNodeY },
						data: {},
					};

					updatedNodes.push(newNode);

					set({ nodes: updatedNodes });

					const updatedEdges = get().edges.filter(edge => edge.source !== id);
					updatedEdges.push({
						id: `e-${id}-${newNode.id}`,
						source: id,
						target: newNode.id,
						deletable: false,
						type: 'simple',
					} satisfies SimpleEdge);

					set({ edges: updatedEdges });
				}

				get().saveSnapshot();

				return setTimeout(() => {
					get().onLayout('TB');
				}, 100);
			},

			updateTriggerNode: (id: string, data: TriggerNode['data']) => {
				const prevNodes = get().nodes;
				const triggerNodeIndex = prevNodes.findIndex(node => node.id === id);
				const triggerNode = prevNodes[triggerNodeIndex];

				if (!triggerNode) {
					console.error('Node not found');
					return set({ nodes: prevNodes });
				}

				const updatedNodes = prevNodes.map(node => {
					if (node.id === id) {
						const updatedTriggerNode: TriggerNode = {
							...node,
							type: 'trigger',
							data,
						};
						return updatedTriggerNode;
					}
					return node;
				});

				set({ nodes: updatedNodes });
			},

			updateWaitNode: (id: string, data: WaitNode['data']) => {
				const prevNodes = get().nodes;
				const waitNodeIndex = prevNodes.findIndex(node => node.id === id);
				const waitNode = prevNodes[waitNodeIndex];

				if (!waitNode) {
					console.error('Node not found');
					return set({ nodes: prevNodes });
				}

				const updatedNodes = prevNodes.map(node => {
					if (node.id === id) {
						const updatedWaitNote: WaitNode = {
							...node,
							type: 'wait',
							data,
						};
						return updatedWaitNote;
					}
					return node;
				});

				set({ nodes: updatedNodes });
			},

			updateSendEmailNode: (id: string, data: SendEmailNode['data']) => {
				const prevNodes = get().nodes;
				const sendEmailNodeIndex = prevNodes.findIndex(node => node.id === id);
				const sendEmailNode = prevNodes[sendEmailNodeIndex];

				if (!sendEmailNode) {
					console.error('Node not found');
					return set({ nodes: prevNodes });
				}

				const updatedNodes = prevNodes.map(node => {
					if (node.id === id) {
						const updatedSendEmailNode: SendEmailNode = {
							...node,
							type: 'sendEmail',
							data,
						};
						return updatedSendEmailNode;
					}
					return node;
				});

				return set({ nodes: updatedNodes });
			},

			updateBooleanNode: (id: string, data: BooleanNode['data']) => {
				const prevNodes = get().nodes;
				const booleanNodeIndex = prevNodes.findIndex(node => node.id === id);
				const booleanNode = prevNodes[booleanNodeIndex];
				if (!booleanNode) {
					console.error('Node not found');
					return set({ nodes: prevNodes });
				}

				const updatedNodes = prevNodes.map(node => {
					if (node.id === id) {
						const updatedBooleanNode: BooleanNode = {
							...node,
							type: 'boolean',
							data,
						};
						return updatedBooleanNode;
					}
					return node;
				});
				return set({ nodes: updatedNodes });
			},

			updateAddToMailchimpAudienceNode: (
				id: string,
				data: AddToMailchimpAudienceNode['data'],
			) => {
				const prevNodes = get().nodes;
				const addToMailchimpAudienceNodeIndex = prevNodes.findIndex(
					node => node.id === id,
				);
				const addToMailchimpAudienceNode = prevNodes[addToMailchimpAudienceNodeIndex];
				if (!addToMailchimpAudienceNode) {
					console.error('Node not found');
					return set({ nodes: prevNodes });
				}

				const updatedNodes = prevNodes.map(node => {
					if (node.id === id) {
						return {
							...node,
							type: 'addToMailchimpAudience',
							data,
						} satisfies AddToMailchimpAudienceNode;
					}
					return node;
				});

				return set({ nodes: updatedNodes });
			},

			//layout
			onLayout: (direction: 'TB' | 'LR' = 'TB') => {
				const initialNodes = get().nodes;
				const initialEdges = get().edges;

				const { nodes: layoutedNodes, edges: layoutedEdges } = getFlowLayout(
					initialNodes,
					initialEdges,
					direction,
				);

				set({
					nodes: [...layoutedNodes],
					edges: [...layoutedEdges],
				});
			},

			// modal
			showTriggerModal: false,
			setShowTriggerModal: (open: boolean) => {
				set({ showTriggerModal: open });
			},
			showEmailModal: false,
			setShowEmailModal: (open: boolean) => {
				set({ showEmailModal: open });
			},
			showWaitModal: false,
			setShowWaitModal: (open: boolean) => {
				set({ showWaitModal: open });
			},
			showBooleanModal: false,
			setShowBooleanModal: (open: boolean) => {
				set({ showBooleanModal: open });
			},
			showMailchimpAudienceModal: false,
			setShowMailchimpAudienceModal: (open: boolean) => {
				set({ showMailchimpAudienceModal: open });
			},
		})),
	);

	return (
		<FlowStoreContext.Provider value={flowStore}>{children}</FlowStoreContext.Provider>
	);
};

export const useFlowStore = <T,>(selector: (state: FlowState) => T) => {
	const flowStore = useContext(FlowStoreContext);
	if (!flowStore) {
		throw new Error('useFlowStore must be used within a FlowStoreProvider');
	}
	return useStore(flowStore, selector);
};
