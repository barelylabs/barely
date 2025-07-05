import type { Edge } from '@xyflow/react';

export type SimpleEdge = Edge & {
	type: 'simple';
};
export type BooleanEdge = Edge & {
	type: 'boolean';
	data: {
		boolean: boolean;
	};
};

export type FlowEdge = SimpleEdge | BooleanEdge;
