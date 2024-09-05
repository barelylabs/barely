import type { Edge, Node, OnConnect, OnEdgesChange, OnNodesChange } from '@xyflow/react';
import type { z } from 'zod';

import type {
	flowForm_addToMailchimpAudienceSchema,
	flowForm_booleanSchema,
	flowForm_sendEmailSchema,
	flowForm_waitSchema,
	FlowTrigger,
} from './flow.schema';

export interface TriggerNode extends Node {
	type: 'trigger';
	data: Pick<FlowTrigger, 'type'> &
		Partial<Pick<FlowTrigger, 'cartFunnelId' | 'productId' | 'totalOrderAmount'>>;
}

export interface EmptyNode extends Node {
	type: 'empty';
	deletable: false;
}

export interface WaitNode extends Node {
	type: 'wait';
	data: z.infer<typeof flowForm_waitSchema>;
}

export type SendEmailNode = Node & {
	type: 'sendEmail';
	data: z.infer<typeof flowForm_sendEmailSchema>;
};

export interface BooleanNode extends Node {
	type: 'boolean';
	data: z.infer<typeof flowForm_booleanSchema>;
}

export interface AddToMailchimpAudienceNode extends Node {
	type: 'addToMailchimpAudience';
	data: z.infer<typeof flowForm_addToMailchimpAudienceSchema>;
}

export type ActionNode =
	| EmptyNode
	| WaitNode
	| SendEmailNode
	| BooleanNode
	| AddToMailchimpAudienceNode;

export type FlowNode = TriggerNode | ActionNode;

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

export interface FlowSnapshot {
	nodes: FlowNode[];
	edges: FlowEdge[];
}

export interface FlowState {
	nodes: FlowNode[];
	edges: FlowEdge[];
	currentNode: FlowNode | null;
	// history
	history: FlowSnapshot[];
	historyIndex: number;
	saveSnapshot: () => void;
	undo: () => void;
	redo: () => void;
	// set
	setNodes: (nodes: FlowNode[]) => void;
	setEdges: (edges: FlowEdge[]) => void;
	setCurrentNode: (id: string) => void;
	// on
	onNodesChange: OnNodesChange<FlowNode>;
	onEdgesChange: OnEdgesChange<FlowEdge>;
	onConnect: OnConnect;
	// onNodesDelete: (nodesToDelete: FlowNode[]) => void;
	onLayout: (direction: 'TB' | 'LR') => void;
	canInsertNodeInEdge: (edgeId: string) => boolean;
	insertActionNodeInEdge: (edgeId: string, type: ActionNode['type']) => void;
	// custom setters
	replaceEmptyWithActionNode: (id: string, type: ActionNode['type']) => void;
	updateTriggerNode: (id: string, data: TriggerNode['data']) => void;
	updateBooleanNode: (id: string, data: BooleanNode['data']) => void;
	updateWaitNode: (id: string, data: WaitNode['data']) => void;
	updateSendEmailNode: (id: string, data: SendEmailNode['data']) => void;
	updateNodeEnabled: (id: string, enabled: boolean) => void;
	updateAddToMailchimpAudienceNode: (
		id: string,
		data: AddToMailchimpAudienceNode['data'],
	) => void;
	// modals
	showTriggerModal: boolean;
	setShowTriggerModal: (open: boolean) => void;
	showEmailModal: boolean;
	setShowEmailModal: (open: boolean) => void;
	showWaitModal: boolean;
	setShowWaitModal: (open: boolean) => void;
	showBooleanModal: boolean;
	setShowBooleanModal: (open: boolean) => void;
	showMailchimpAudienceModal: boolean;
	setShowMailchimpAudienceModal: (open: boolean) => void;
}
