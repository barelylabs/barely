import type {
	FlowBooleanCondition,
	FlowTrigger,
} from '@barely/lib/server/routes/flow/flow.constants';
import type { TriggerWaitUnits } from '@barely/lib/trigger/trigger.constants';
import type { Edge, Node, OnConnect, OnEdgesChange, OnNodesChange } from '@xyflow/react';

import type { FlowEmailData } from '../_components/flow-email-modal';

export interface TriggerNode extends Node {
	type: 'trigger';
	data: {
		trigger: FlowTrigger;
	};
}

export interface EmptyNode extends Node {
	type: 'empty';
	deletable: false;
}

export interface WaitNode extends Node {
	type: 'wait';
	data: {
		duration: number;
		units: TriggerWaitUnits;
	};
}

export type SendEmailNode = Node & {
	type: 'sendEmail';
	data: Omit<FlowEmailData, 'id'>;
};

export interface BooleanNode extends Node {
	type: 'boolean';
	data: {
		condition: FlowBooleanCondition;
	};
}

export type FlowNode = TriggerNode | EmptyNode | WaitNode | SendEmailNode | BooleanNode;

export type FlowEdge = Edge;

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
	// custom setters
	replaceEmptyWithNode: (id: string, type: FlowNode['type']) => void;
	updateTriggerNode: (id: string, data: TriggerNode['data']) => void;
	updateBooleanNode: (id: string, data: BooleanNode['data']) => void;
	updateWaitNode: (id: string, data: WaitNode['data']) => void;
	updateSendEmailNode: (id: string, data: SendEmailNode['data']) => void;
	// modals
	showTriggerModal: boolean;
	setShowTriggerModal: (open: boolean) => void;
	showEmailModal: boolean;
	setShowEmailModal: (open: boolean) => void;
	showWaitModal: boolean;
	setShowWaitModal: (open: boolean) => void;
	showBooleanModal: boolean;
	setShowBooleanModal: (open: boolean) => void;
}
