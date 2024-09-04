import type {
	BooleanEdge,
	SimpleEdge,
} from '@barely/lib/server/routes/flow/flow.ui.types';
import type { BezierEdgeProps } from '@xyflow/react';
import { BezierEdge } from '@xyflow/react';

export function SimpleEdgeType(simpleEdge: SimpleEdge & BezierEdgeProps) {
	return <BezierEdge {...simpleEdge} />;
}

export function BooleanEdgeType(booleanEdge: BooleanEdge & BezierEdgeProps) {
	return <BezierEdge {...booleanEdge} label={booleanEdge.data.boolean ? 'Yes' : 'No'} />;
}
