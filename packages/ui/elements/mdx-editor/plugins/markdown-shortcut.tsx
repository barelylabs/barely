import type {
	ElementTransformer,
	TextFormatTransformer,
	TextMatchTransformer,
} from '@lexical/markdown';
import type { HeadingTagType } from '@lexical/rich-text';
import type { HEADING_LEVEL } from '@mdxeditor/editor';
import type { ElementNode } from 'lexical';
import React from 'react';
import {
	BOLD_ITALIC_STAR,
	BOLD_ITALIC_UNDERSCORE,
	BOLD_STAR,
	BOLD_UNDERSCORE,
	CHECK_LIST,
	CODE,
	INLINE_CODE,
	ITALIC_STAR,
	ITALIC_UNDERSCORE,
	LINK,
	ORDERED_LIST,
	QUOTE,
	UNORDERED_LIST,
} from '@lexical/markdown';
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin.js';
import { $createHeadingNode, $isHeadingNode, HeadingNode } from '@lexical/rich-text';
import {
	$createCodeBlockNode,
	activePlugins$,
	addComposerChild$,
	addNestedEditorChild$,
	allowedHeadingLevels$,
	CodeBlockNode,
	realmPlugin,
} from '@mdxeditor/editor';

// import { realmPlugin } from '../../RealmWithPlugins';
// import { $createCodeBlockNode, CodeBlockNode } from '../codeblock/CodeBlockNode';
// import { activePlugins$, addComposerChild$, addNestedEditorChild$ } from '../core';
// import { allowedHeadingLevels$, HEADING_LEVEL } from '../headings';

/**
 * A plugin that adds markdown shortcuts to the editor.
 * @group Markdown Shortcuts
 */
export const markdownShortcutPlugin = realmPlugin({
	init(realm) {
		const pluginIds = realm.getValue(activePlugins$);
		const allowedHeadingLevels: readonly HEADING_LEVEL[] =
			pluginIds.includes('headings') ? realm.getValue(allowedHeadingLevels$) : [];
		const transformers = pickTransformersForActivePlugins(
			pluginIds,
			allowedHeadingLevels,
		);
		realm.pubIn({
			[addComposerChild$]: () => <MarkdownShortcutPlugin transformers={transformers} />,
			[addNestedEditorChild$]: () => (
				<MarkdownShortcutPlugin transformers={transformers} />
			),
		});
	},
});

const createBlockNode = (
	createNode: (match: string[]) => ElementNode,
): ElementTransformer['replace'] => {
	return (parentNode, children, match) => {
		const node = createNode(match);
		node.append(...children);
		parentNode.replace(node);
		node.select(0, 0);
	};
};

function pickTransformersForActivePlugins(
	pluginIds: string[],
	allowedHeadingLevels: readonly HEADING_LEVEL[],
) {
	const transformers: (
		| ElementTransformer
		| TextFormatTransformer
		| TextMatchTransformer
	)[] = [
		BOLD_ITALIC_STAR,
		BOLD_ITALIC_UNDERSCORE,
		BOLD_STAR,
		BOLD_UNDERSCORE,
		INLINE_CODE,
		ITALIC_STAR,
		ITALIC_UNDERSCORE,
		// HIGHLIGHT,
		// STRIKETHROUGH
	];

	if (pluginIds.includes('headings')) {
		// Using a range is technically a bug, because the developer might have allowed h2 and h4, but not h3.
		// However, it's a very unlikely edge case.
		const minHeadingLevel = Math.min(...allowedHeadingLevels);
		const maxHeadingLevel = Math.max(...allowedHeadingLevels);
		const headingRegExp = new RegExp(`^(#{${minHeadingLevel},${maxHeadingLevel}})\\s`);

		const HEADING: ElementTransformer = {
			dependencies: [HeadingNode],
			export: (node, exportChildren) => {
				if (!$isHeadingNode(node)) {
					return null;
				}
				const level = Number(node.getTag().slice(1));
				return '#'.repeat(level) + ' ' + exportChildren(node);
			},
			regExp: headingRegExp,
			replace: createBlockNode(match => {
				const tag = `h${match[1]?.length}` as HeadingTagType;
				return $createHeadingNode(tag);
			}),
			type: 'element',
		};
		transformers.push(HEADING);
	}

	if (pluginIds.includes('quote')) {
		transformers.push(QUOTE);
	}

	if (pluginIds.includes('link')) {
		transformers.push(LINK);
	}
	if (pluginIds.includes('lists')) {
		transformers.push(ORDERED_LIST, UNORDERED_LIST, CHECK_LIST);
	}

	if (pluginIds.includes('codeblock')) {
		const codeTransformerCopy: ElementTransformer = {
			...CODE,
			dependencies: [CodeBlockNode],
			replace: (parentNode, _children, match) => {
				const codeBlockNode = $createCodeBlockNode({
					code: '',
					language: match[1] ?? '',
					meta: '',
				});
				parentNode.replace(codeBlockNode);
				setTimeout(() => {
					codeBlockNode.select();
				}, 80);
			},
		};
		transformers.push(codeTransformerCopy);
	}

	return transformers;
}
