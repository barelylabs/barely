import { newId } from '@barely/lib/utils/id';
import dagre from '@dagrejs/dagre';
import { addEdge, applyEdgeChanges, applyNodeChanges, Position } from '@xyflow/react';
import { create } from 'zustand';

import type {
	BooleanNode,
	EmptyNode,
	FlowEdge,
	FlowNode,
	FlowState,
	SendEmailNode,
	TriggerNode,
	WaitNode,
} from './flow-types';
import { initialEdges } from './flow-edges';
import { initialNodes } from './flow-nodes';

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const getLayoutedElements = (nodes: FlowNode[], edges: FlowEdge[], direction = 'TB') => {
	const isHorizontal = direction === 'LR';
	dagreGraph.setGraph({ rankdir: direction, ranker: 'network-simplex' });

	nodes.forEach(node => {
		dagreGraph.setNode(node.id, {
			width: node.measured?.width,
			height: node.measured?.height,
		});
	});

	// i *think* sorting the edges here helps with not swapping the boolean nodes onLayout, but it's not perfect
	// i'd rather be able to define the order of the edges in the graph itself, but i can't figure out how to do that
	const sortedEdges = [...edges].sort((a, b) => {
		if (a.label === 'Yes' && b.label === 'No') return -1;
		if (a.label === 'No' && b.label === 'Yes') return 1;
		return 0;
	});

	sortedEdges.forEach(edge => {
		dagreGraph.setEdge(edge.source, edge.target);
	});

	dagre.layout(dagreGraph);

	const newNodes = nodes.map(node => {
		const nodeWithPosition = dagreGraph.node(node.id);
		const newNode = {
			...node,
			targetPosition: isHorizontal ? Position.Left : Position.Top,
			sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
			// We are shifting the dagre node position (anchor=center center) to the top left
			// so it matches the React Flow node anchor point (top left).
			position: {
				x: nodeWithPosition.x - nodeWithPosition.width / 2,
				y: nodeWithPosition.y - nodeWithPosition.height / 2,
			},
		};

		return newNode;
	});

	return { nodes: newNodes, edges };

	// return { nodes, edges };
};

// this is our useStore hook that we can use in our components to get parts of the store and call actions
export const useFlowStore = create<FlowState>((set, get) => ({
	nodes: initialNodes,
	edges: initialEdges,
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
					const newNode: BooleanNode = {
						id,
						type: 'boolean',
						data: {
							condition: 'HAS_ORDERED',
						},
						position: { x: newNodeX, y: emptyNodeY },
					};
					return newNode;
				} else if (type === 'wait') {
					const newNode: WaitNode = {
						id,
						type: 'wait',
						data: {
							duration: 5,
							units: 'minutes',
						},
						position: { x: newNodeX, y: emptyNodeY },
					};
					return newNode;
				} else if (type === 'sendEmail') {
					const newEmailId = newId('email');
					const newNode: SendEmailNode = {
						id,
						type: 'sendEmail',
						data: {
							email: {
								id: newEmailId,
								subject: '',
								body: '',
							},
						},
						position: { x: newNodeX, y: emptyNodeY },
					};
					return newNode;
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
			const newTrueNode: EmptyNode = {
				id: newId('flowAction'),
				type: 'empty',
				deletable: false,
				position: { x: newNodeX - spacing.x / 2, y: newEmptyNodeY },
				data: {},
			};
			const newFalseNode: EmptyNode = {
				id: newId('flowAction'),
				type: 'empty',
				deletable: false,
				position: { x: newNodeX + spacing.x / 2, y: newEmptyNodeY },
				data: {},
			};

			updatedNodes.push(newTrueNode, newFalseNode);

			set({ nodes: updatedNodes });

			const updatedEdges = get().edges.filter(edge => edge.source !== id);

			updatedEdges.push(
				{
					id: `e-${id}-${newTrueNode.id}`,
					data: { boolean: true },
					source: id,
					target: newTrueNode.id,
					label: 'Yes',
					deletable: false,
				},
				{
					id: `e-${id}-${newFalseNode.id}`,
					data: { boolean: false },
					source: id,
					target: newFalseNode.id,
					label: 'No',
					deletable: false,
				},
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
			});

			set({ edges: updatedEdges });
		}

		get().saveSnapshot();

		// console.log('about to layout');
		return setTimeout(() => {
			// console.log('layouting');
			get().onLayout('TB');
			// console.log('done layouting');
		}, 100);

		// return setTimeout(() => onLayoutRef)
		// set({ nodes: updatedNodes });

		// set edges
		// if (type === 'boolean') {
		// 	updatedEdges.push(
		// 		{
		// 			id: `e_${id}-true`,
		// 			data: { boolean: true },
		// 			source: id,
		// 			target: `${id}-true`,
		// 			label: 'Yes',
		// 		},
		// 		{ id: `e_${id}-false`, source: id, target: `${id}-false`, label: 'No' },
		// 	);
		// } else {
		// 	updatedEdges.push({
		// 		id: `e_${id}-new`,
		// 		source: id,
		// 		target: `${id}-new`,
		// 		label: 'Next',
		// 	});
		// }
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

	//layout
	onLayout: (direction: 'TB' | 'LR') => {
		// console.log('onLayout');
		const initialNodes = get().nodes;
		const initialEdges = get().edges;

		const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
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
}));
