'use client';

import type { FlowEdge } from '@barely/db/schema';
import dagre from '@dagrejs/dagre';
import { Position } from '@xyflow/react';

import type { FlowNode } from './flow.ui.types';

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

export const getFlowLayout = (nodes: FlowNode[], edges: FlowEdge[], direction = 'TB') => {
	const isHorizontal = direction === 'LR';
	dagreGraph.setGraph({
		rankdir: direction,
		ranker: 'network-simplex',

		ranksep: 75,
	});

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
};
