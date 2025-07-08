'use client';

/* refs: 
https://tkdodo.eu/blog/zustand-and-react-context
https://gist.github.com/bryanltobing/e09cb4bb110c4d10cefde665b572d899#file-viewmodelzustand-tsx-L22-L27
*/
import type { AppRouterOutputs } from '@barely/api/app/app.router';
import type {
	ActionNode,
	AddToMailchimpAudienceNode,
	BooleanEdge,
	BooleanNode,
	EmptyNode,
	FlowEdge,
	FlowNode,
	FlowState,
	SendEmailFromTemplateGroupNode,
	SendEmailNode,
	SimpleEdge,
	TriggerNode,
	WaitNode,
} from '@barely/validators';
import type { Edge, Node } from '@xyflow/react';
import type { StoreApi } from 'zustand';
import { createContext, use, useContext, useState } from 'react';
import { getFlowLayout } from '@barely/lib/functions/flows/flow.layout';
import {
	getDefaultFlowAction,
	getDefaultFlowAction_empty,
	hasEdgeLoop,
} from '@barely/lib/functions/flows/flow.utils';
import { useToast } from '@barely/toast';
import { newId, raise } from '@barely/utils';
import { addEdge, applyEdgeChanges, applyNodeChanges, getIncomers } from '@xyflow/react';
import deepEqual from 'fast-deep-equal';
import { createStore, useStore } from 'zustand';

const FlowStoreContext = createContext<StoreApi<FlowState> | null>(null);

export const FlowStoreProvider = ({
	children,
	initialFlow,
	defaultEmailAddress,
	initialDefaultEmailTemplateGroup,
	initialDefaultMailchimpAudienceId,
}: {
	children: React.ReactNode;
	initialFlow: Promise<AppRouterOutputs['flow']['byId']>;
	defaultEmailAddress: Promise<AppRouterOutputs['emailAddress']['default']>;
	initialDefaultMailchimpAudienceId: Promise<
		AppRouterOutputs['mailchimp']['defaultAudience']
	>;
	initialDefaultEmailTemplateGroup: Promise<
		AppRouterOutputs['emailTemplateGroup']['default']
	>;
}) => {
	const initialData = use(initialFlow);
	const defaultFromEmail = use(defaultEmailAddress);
	const defaultMailchimpAudienceId = use(initialDefaultMailchimpAudienceId);
	const defaultEmailTemplateGroup = use(initialDefaultEmailTemplateGroup);
	const flowId = initialData.flow.id;

	const { toast } = useToast();

	const [flowStore] = useState(() =>
		createStore<FlowState>((set, get) => ({
			nodes: initialData.uiNodes,
			edges: initialData.uiEdges,
			currentNode: null,

			// history
			history: [
				{
					nodes: initialData.uiNodes,
					edges: initialData.uiEdges,
				},
			],
			historyIndex: 0,
			lastCommittedHistoryIndex: 0,
			setCurrentAsLastSaved: () => {
				// const historyIndex = get().historyIndex;
				set({
					lastCommittedHistoryIndex: get().historyIndex,
				});
			},
			saveSnapshot: () => {
				const currentState = {
					nodes: get().nodes,
					edges: get().edges,
				};
				console.log('saving snapshot', currentState);
				const historyIndex = get().historyIndex;
				console.log('historyIndex', historyIndex);

				// let isDirty = false;
				// const lastCommittedHistoryIndex = get().lastCommittedHistoryIndex;
				// const lastCommittedState = get().history[lastCommittedHistoryIndex];

				// const isDirty = !deepEqual(currentState, lastCommittedState);
				get().checkIfDirty();

				// console.log('lastCommittedState', lastCommittedState);
				// console.log('snapshot is dirty', isDirty);

				set({
					history: [...get().history.slice(0, historyIndex + 1), currentState],
					historyIndex: historyIndex + 1,
					// isDirty,
				});
			},

			checkIfDirty: () => {
				const currentState = {
					nodes: get().nodes,
					edges: get().edges,
				};
				const lastCommittedState = get().history[get().lastCommittedHistoryIndex];
				const isDirty = !deepEqual(currentState, lastCommittedState);
				console.log('isDirty', isDirty);

				set({ isDirty });

				return isDirty;
			},
			isDirty: false,
			// setIsDirty: (dirty: boolean) => {
			// 	set({ isDirty: dirty });
			// },
			// isDirty: () => {
			//     // const
			//     const currentState = {
			//         nodes: get().nodes,
			//         edges: get().edges
			//     };
			//     const lastCommittedState = get().history[get().lastCommittedHistoryIndex];

			//     if (!lastCommittedState) {
			//         return get().historyIndex >= 0;
			//     }

			//     return JSON.stringify(currentState) !== JSON.stringify(lastCommittedState);
			//     return true;
			// }
			// isDirty: false,
			// setIsDirty: (dirty: boolean) => {
			// 	set({ isDirty: dirty });
			// },

			//selection
			selectedNodes: [],
			selectedEdges: [],
			setSelectedNodes: (nodes: FlowNode[]) => {
				set({ selectedNodes: nodes });
			},
			setSelectedEdges: (edges: FlowEdge[]) => {
				set({ selectedEdges: edges });
			},
			// setSelection: (selection: { nodes: FlowNode[]; edges: FlowEdge[] }) => {
			// 	set({ selectedNodes: selection.nodes, selectedEdges: selection.edges });
			// },
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
				get().checkIfDirty();
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
				get().checkIfDirty();
				return setTimeout(() => {
					get().onLayout('TB');
				}, 0);
			},

			onNodesChange: changes => {
				// console.log('onNodesChange', changes);

				// const removedNodeIds = changes
				// 	.filter(change => change.type === 'remove')
				// 	.map(change => change.id);
				// console.log('removedNodeIds', removedNodeIds);

				// const prevNodes = get().nodes;
				// console.log('prevNodes', prevNodes);
				// const prevEdges = get().edges;
				// // console.log('prevEdges', prevEdges);

				// const removedNodes = get().nodes.filter(node => removedNodeIds.includes(node.id));
				// console.log('removedNodes', removedNodes);

				// // const removedEdges = get().edges.filter(edge =>
				// // 	removedNodeIds.includes(edge.source) || removedNodeIds.includes(edge.target),
				// // );
				// // console.log('removedEdges', removedEdges);

				// if (
				// 	removedNodes.length > 0 &&
				// 	removedNodes.some(node => node.type === 'boolean')
				// ) {
				// 	console.log('removing nodes', removedNodes);

				// 	console.log('boolean node deleted');
				// 	return;
				// } else {
				// }
				set({
					nodes: applyNodeChanges(changes, get().nodes),
				});
			},

			onEdgesChange: changes => {
				set({
					edges: applyEdgeChanges(changes, get().edges),
				});
			},

			onSelectionChange: (selection: { nodes: Node[]; edges: Edge[] }) => {
				set({
					selectedNodes: selection.nodes as unknown as FlowNode[],
					selectedEdges: selection.edges as unknown as FlowEdge[],
				});
			},

			onConnect: connection => {
				// console.log('onConnect', connection);

				const hasLoop = hasEdgeLoop([...get().edges, connection]);
				console.log('hasLoop', hasLoop);

				if (hasLoop) {
					toast('Cannot create a loop');
					return;
				}

				// if the source is an empty node, instead of adding a new edge we should
				// modify the existing edge to point to the target

				const prevNodes = get().nodes;
				const prevEdges = get().edges;

				const sourceNode = prevNodes.find(node => node.id === connection.source);

				if (!sourceNode) {
					console.error('sourceNode not found');
					return;
				}

				// const incomers = getIncomers(sourceNode, prevNodes, prevEdges);
				const sourceNodeParent = getIncomers(sourceNode, prevNodes, prevEdges)[0];
				console.log('sourceNodeParent', sourceNodeParent);

				const targetNode = prevNodes.find(node => node.id === connection.target);
				console.log('targetNode', targetNode);

				if (!targetNode) {
					console.error('targetNode not found');
					return;
				}

				const targetNodeParent = getIncomers(targetNode, prevNodes, prevEdges)[0];
				console.log('targetNodeParent', targetNodeParent);

				// const targetNode = prevNodes.find(node => node.id === connection.target);

				if (sourceNode.type === 'empty') {
					const edgeAboveEmptySource = prevEdges.find(
						edge => edge.target === connection.source,
					);

					console.log('edgeAboveEmptySource', edgeAboveEmptySource);

					const edgeAboveEmptyTarget = prevEdges.find(
						edge => edge.target === connection.target,
					);

					console.log('edgeAboveEmptyTarget', edgeAboveEmptyTarget);

					if (edgeAboveEmptyTarget) {
						// there's an 'edge' case we want to handle here:
						// if the edgeAboveEmpty

						if (edgeAboveEmptyTarget.source === edgeAboveEmptySource?.source) {
							console.log(
								'sourceNode and targetNode have the same source. that should only be possible if the sourceNode is a boolean node',
								sourceNodeParent,
							);
							const deleteBooleanNode = window.confirm(
								'This will delete the boolean node. Are you sure you want to continue?',
							);
							if (deleteBooleanNode) {
								console.log('deleting boolean node and empty source node');

								const sourceBooleanNodeParentNode = getIncomers(
									sourceNodeParent ?? raise('no sourceNodeParent'),
									prevNodes,
									prevEdges,
								)[0];
								console.log('sourceBooleanNodeParentNode', sourceBooleanNodeParentNode);
								const newNodes = prevNodes.filter(
									node => node.id !== sourceNode.id && node.id !== sourceNodeParent?.id,
								);

								// we also want to delete 3 edges:
								// 1. the edge above the sourceNode
								// 2. the edge above the targetNode
								// 3. the edge above the sourceNodeParent (which is the boolean node)

								const filteredEdges = prevEdges.filter(
									edge =>
										edge.target !== connection.target &&
										edge.target !== sourceNodeParent?.id &&
										edge.id !== edgeAboveEmptyTarget.id &&
										edge.id !== edgeAboveEmptySource.id,
								);

								const createdEdge = {
									id: `e-${sourceBooleanNodeParentNode?.id}-${connection.target}`,
									source: sourceBooleanNodeParentNode?.id ?? raise('no source'),
									target: connection.target,
									type: 'simple',
								} satisfies SimpleEdge;

								console.log('newNodes', newNodes);
								console.log('filteredEdges', filteredEdges);
								console.log('createdEdge', createdEdge);
								return set({
									nodes: [...newNodes],
									edges: [...filteredEdges, createdEdge],
								});
							} else return;
						}

						console.log('edgeAboveEmpty', edgeAboveEmptyTarget);
						return set({
							nodes: prevNodes.filter(node => node.id !== sourceNode.id),
							edges: prevEdges.map(edge => {
								if (edge.id === edgeAboveEmptyTarget.id) {
									return {
										...edge,
										target: connection.target,
									};
								}
								return edge;
							}),
						});
					}
				}

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

			replaceEmptyWithActionNode: (id: string, type: ActionNode['type']) => {
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
						(prevNodes.find(node => node.type === 'boolean')?.measured?.width ?? 0)
					: type === 'wait' ?
						(prevNodes.find(node => node.type === 'wait')?.measured?.width ?? 0)
					: type === 'sendEmail' ?
						(prevNodes.find(node => node.type === 'sendEmail')?.measured?.width ?? 0)
					:	0;

				const newNodeX = emptyNodeX + (emptyNodeWidth - newNodeWidth) / 2;

				const updatedNodes = prevNodes.map((node, index) => {
					if (index === replacedNodeIndex) {
						try {
							const test = getDefaultFlowAction({
								flowId,
								id,
								position: { x: newNodeX, y: emptyNodeY },
								type,
								toast,
								mailchimpAudienceId: defaultMailchimpAudienceId ?? undefined,
								emailTemplateGroupId: defaultEmailTemplateGroup?.id ?? undefined,
								emailTemplate:
									defaultFromEmail ?
										{
											fromId: defaultFromEmail.id,
										}
									:	undefined,
							});

							return test.flowActionNode;

							// return test.flowActionNode satisfies ActionNode;
						} catch (error) {
							console.error('Error creating flow action node', error);
							return node;
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
						id: newId('flowAction'), //fixme: this would ideally be the same id as the replaced node (for history/dirty state tracking), and the new node would have a new id instead, but that'd require calculating new edges up top and then handling deleting edges properly too. for another time.
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

			updateSendEmailFromTemplateGroupNode: (
				id: string,
				data: SendEmailFromTemplateGroupNode['data'],
			) => {
				const prevNodes = get().nodes;
				const sendEmailFromTemplateGroupNodeIndex = prevNodes.findIndex(
					node => node.id === id,
				);
				const sendEmailFromTemplateGroupNode =
					prevNodes[sendEmailFromTemplateGroupNodeIndex];
				if (!sendEmailFromTemplateGroupNode) {
					console.error('Node not found');
					return set({ nodes: prevNodes });
				}

				const updatedNodes = prevNodes.map(node => {
					if (node.id === id) {
						return {
							...node,
							type: 'sendEmailFromTemplateGroup',
							data,
						} satisfies SendEmailFromTemplateGroupNode;
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

			// insert in between nodes
			canInsertNodeInEdge: (edgeId: string) => {
				const edges = get().edges;
				const edge = edges.find(edge => edge.id === edgeId);

				const target = edge ? get().nodes.find(node => node.id === edge.target) : null;

				if (!target || target.type === 'empty') return false;
				return true;
			},

			insertActionNodeInEdge: (edgeId: string, type: ActionNode['type']) => {
				const prevEdges = get().edges;
				const prevNodes = get().nodes;

				const prevEdge = prevEdges.find(edge => edge.id === edgeId);
				if (!prevEdge) return;

				const source = get().nodes.find(node => node.id === prevEdge.source);
				if (!source || source.type === 'empty') return;

				const target = get().nodes.find(node => node.id === prevEdge.target);
				if (!target || target.type === 'empty') return;

				// create new node
				const { flowActionNode } = getDefaultFlowAction({
					flowId,
					id: newId('flowAction'),
					position: { x: target.position.x, y: target.position.y + 100 },
					type,
					toast,
					mailchimpAudienceId: defaultMailchimpAudienceId ?? undefined,
					emailTemplateGroupId: defaultEmailTemplateGroup?.id ?? undefined,
					emailTemplate:
						defaultFromEmail ?
							{
								fromId: defaultFromEmail.id,
							}
						:	undefined,
				});

				set({ nodes: [...prevNodes, flowActionNode] });

				// remove current edge
				const updatedEdges = prevEdges.filter(edge => edge.id !== edgeId);

				// connect prev source to new node
				updatedEdges.push({
					...prevEdge,
					id: `e-${prevEdge.source}-${flowActionNode.id}`,
					// source: prevEdge.source,
					target: flowActionNode.id,
				} satisfies FlowEdge);

				// connect new node to prev target
				updatedEdges.push({
					...prevEdge,
					id: `e-${flowActionNode.id}-${prevEdge.target}`,
					source: flowActionNode.id,
					// target: prevEdge.target,
					deletable: false,
					type: 'simple',
				} satisfies SimpleEdge);

				set({ edges: updatedEdges });

				get().saveSnapshot();

				return setTimeout(() => {
					get().onLayout('TB');
				}, 100);
			},

			updateNodeEnabled: (id: string, enabled: boolean) => {
				const prevNodes = get().nodes;
				const nodeIndex = prevNodes.findIndex(node => node.id === id);
				const node = prevNodes[nodeIndex];
				if (!node) return;

				const updatedNodes = prevNodes.map(node => {
					if (node.id === id) {
						if (node.type === 'trigger') {
							return {
								...node,
								data: {
									...node.data,
									enabled,
								},
							} satisfies TriggerNode;
						}
						if (node.type === 'wait') {
							return {
								...node,
								data: {
									...node.data,
									enabled,
								},
							} satisfies WaitNode;
						}

						if (node.type === 'sendEmail') {
							return {
								...node,
								data: {
									...node.data,
									enabled,
								},
							} satisfies SendEmailNode;
						}

						if (node.type === 'sendEmailFromTemplateGroup') {
							return {
								...node,
								data: {
									...node.data,
									enabled,
								},
							} satisfies SendEmailFromTemplateGroupNode;
						}

						if (node.type === 'addToMailchimpAudience') {
							return {
								...node,
								data: {
									...node.data,
									enabled,
								},
							} satisfies AddToMailchimpAudienceNode;
						}

						if (node.type === 'boolean') {
							return {
								...node,
								data: {
									...node.data,
									enabled,
								},
							} satisfies BooleanNode;
						}

						return {
							...node,
							data: {
								...node.data,
								enabled,
							},
						} satisfies EmptyNode;
					}
					return node;
				});

				set({ nodes: updatedNodes });
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
			showEmailFromTemplateGroupModal: false,
			setShowEmailFromTemplateGroupModal: (open: boolean) => {
				set({ showEmailFromTemplateGroupModal: open });
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
