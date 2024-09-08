import type { LexicalExportVisitor, MdastImportVisitor } from '@mdxeditor/editor';
import type { EditorConfig, LexicalNode, NodeKey, SerializedTextNode } from 'lexical';
import type * as Mdast from 'mdast';
import {
	addActivePlugin$,
	addExportVisitor$,
	addImportVisitor$,
	addLexicalNode$,
	realmPlugin,
} from '@mdxeditor/editor';
import { $applyNodeReplacement, TextNode } from 'lexical';

export class VariableNode extends TextNode {
	static getType(): string {
		return 'variable';
	}

	static clone(node: VariableNode): VariableNode {
		return new VariableNode(node.__text, node.__key);
	}

	constructor(text: string, key?: NodeKey) {
		super(text, key);
	}

	createDOM(config: EditorConfig): HTMLElement {
		const dom = super.createDOM(config);
		dom.className = 'bg-muted';
		dom.setAttribute('data-lexical-variable', 'true');
		return dom;
	}

	exportJSON(): SerializedTextNode {
		return {
			...super.exportJSON(),
			type: 'variable',
			version: 1,
		};
	}

	isTextEntity(): true {
		return true;
	}

	canInsertTextBefore(): boolean {
		return false;
	}

	canInsertTextAfter(): boolean {
		return false;
	}
}

export function $createVariableNode(text = ''): VariableNode {
	const node = new VariableNode(text);
	node.setMode('segmented').toggleDirectionless();
	return $applyNodeReplacement(node);
}

export function $isVariableNode(
	node: LexicalNode | null | undefined,
): node is VariableNode {
	return node instanceof VariableNode;
}

/**
 * LexicalVariableVisitor
 * */

export const LexicalVariableVisitor: LexicalExportVisitor<VariableNode, Mdast.Text> = {
	testLexicalNode: $isVariableNode,
	visitLexicalNode: ({ lexicalNode, mdastParent, actions }) => {
		actions.appendToParent(mdastParent, {
			type: 'text',
			value: lexicalNode.getTextContent(),
		});
	},
};

/**
 * MdastVariableVisitor
 * */

export const MdastVariableVisitor: MdastImportVisitor<Mdast.Text> = {
	testNode: 'variable',
	visitNode: ({ actions }) => {
		actions.addAndStepInto($createVariableNode());
	},
};

/**
 * index
 */

export const variablePlugin = realmPlugin({
	init(realm) {
		realm.pubIn({
			[addActivePlugin$]: 'variable',
			[addImportVisitor$]: [MdastVariableVisitor],
			[addLexicalNode$]: VariableNode,
			[addExportVisitor$]: [LexicalVariableVisitor],
		});
	},
});
