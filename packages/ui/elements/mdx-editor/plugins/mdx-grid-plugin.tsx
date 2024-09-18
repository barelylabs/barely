'use client';

import type { JsxComponentDescriptor } from '@mdxeditor/editor';
import type { LexicalEditor } from 'lexical';
import type { MdxJsxFlowElement } from 'mdast-util-mdx-jsx';
import {
	insertJsx$,
	NestedLexicalEditor,
	Button as ToolbarButton,
	useNestedEditorContext,
	usePublisher,
} from '@mdxeditor/editor';
import {
	$getRoot,
	$getSelection,
	$isParagraphNode,
	$isRangeSelection,
	COMMAND_PRIORITY_CRITICAL,
	DELETE_CHARACTER_COMMAND,
	KEY_BACKSPACE_COMMAND,
} from 'lexical';

import { Icon } from '../../icon';

export const mdxGridPlugin: JsxComponentDescriptor[] = [
	{
		name: 'Card',
		kind: 'flow',
		props: [],
		hasChildren: true,
		Editor: () => {
			return (
				<div className='my-4 rounded-md border border-blue px-4'>
					<NestedLexicalEditor<MdxJsxFlowElement>
						block
						getContent={node => {
							return node.children;
						}}
						// eslint-disable-next-line @typescript-eslint/no-explicit-any
						getUpdatedMdastNode={(mdastNode, children: any) => ({
							...mdastNode,
							// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
							children,
						})}
					/>
				</div>
			);
		},
	},
	{
		name: 'Grid',
		kind: 'flow',
		props: [],
		hasChildren: true,
		Editor: () => {
			const { parentEditor } = useNestedEditorContext();

			parentEditor.registerCommand(
				KEY_BACKSPACE_COMMAND,
				onBackspace,
				COMMAND_PRIORITY_CRITICAL,
			);

			parentEditor.registerCommand(
				DELETE_CHARACTER_COMMAND,
				onBackspace,
				COMMAND_PRIORITY_CRITICAL,
			);

			return (
				<div className='flex flex-col gap-4 rounded-md border border-red p-4'>
					<NestedLexicalEditor<MdxJsxFlowElement>
						block={true}
						getContent={node => {
							const children = node.children;
							if (children.at(-1)?.type !== 'paragraph') {
								children.push({ type: 'paragraph', children: [] });
							}
							return children;
						}}
						// eslint-disable-next-line @typescript-eslint/no-explicit-any
						getUpdatedMdastNode={(mdastNode, children: any) => {
							// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
							if (children.at?.(-1)?.type !== 'paragraph') {
								// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
								children.push({ type: 'paragraph', children: [] });
							}
							return {
								...mdastNode,
								// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
								children,
							};
						}}
					/>
				</div>
			);
		},
	},
];

export const InsertCard = () => {
	const insertJsx = usePublisher(insertJsx$);
	return (
		<>
			<ToolbarButton
				onClick={() =>
					insertJsx({
						name: 'Card',
						kind: 'flow',
						props: {},
					})
				}
			>
				<Icon.card className='h-5 w-5' />
			</ToolbarButton>
		</>
	);
};

export const InsertGrid = () => {
	const insertJsx = usePublisher(insertJsx$);
	return (
		<>
			<ToolbarButton
				onClick={() =>
					insertJsx({
						name: 'Grid',
						kind: 'flow',
						props: {},
					})
				}
			>
				<Icon.grid className='h-5 w-5' />
			</ToolbarButton>
		</>
	);
};

const onBackspace = (ev: KeyboardEvent, editor: LexicalEditor) => {
	const selection = editor.getEditorState().read(() => $getSelection());

	if ($isRangeSelection(selection)) {
		const anchorNode = selection.anchor.getNode();
		const previousNodeIsParagraph =
			anchorNode.getPreviousSibling()?.__type === 'paragraph';
		const anchorNodeIsLastNode = editor.getEditorState().read(() => {
			const rootNode = $getRoot();
			const lastChild = rootNode.getLastChild();
			return anchorNode === lastChild;
		});

		if (
			$isParagraphNode(anchorNode) &&
			!previousNodeIsParagraph &&
			anchorNode.getTextContent().length === 0 &&
			selection.anchor.offset === 0 &&
			anchorNodeIsLastNode
		) {
			return true;
		}
	}

	return false;
};
