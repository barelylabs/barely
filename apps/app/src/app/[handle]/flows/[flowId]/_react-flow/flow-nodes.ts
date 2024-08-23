import type { FlowNode } from './flow-types';

export const initialNodes: FlowNode[] = [
	{
		id: '1',
		type: 'trigger',
		data: { trigger: 'NEW_CART_ORDER' },
		position: { x: 400, y: 25 },
		deletable: false,
	},
	{
		id: '2',
		type: 'empty',
		data: {},
		position: { x: 400, y: 100 },
		deletable: false,
	},
];
