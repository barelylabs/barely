import type {
	InitialConfigType,
	InitialEditorStateType,
} from '@lexical/react/LexicalComposer';
import type { Dispatch, SetStateAction } from 'react';
import { CodeHighlightNode, CodeNode } from '@lexical/code';
import { AutoLinkNode, LinkNode } from '@lexical/link';
import { ListItemNode, ListNode } from '@lexical/list';
import { $convertFromMarkdownString, TRANSFORMERS } from '@lexical/markdown';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { TableCellNode, TableNode, TableRowNode } from '@lexical/table';

import ExampleTheme from './example-theme';
import AutoLinkPlugin from './plugins/auto-link-plugin';
import ToolbarPlugin from './plugins/toolbar-plugin';

import './stylesEditor.css';

import { cn } from '@barely/lib/utils/cn';

import { MarkdownInOutPlugin } from './plugins/markdown-in-out-plugin';

/*
 Detault toolbar items:
  - blockType
  - bold
  - italic
  - link
*/

export interface TextEditorProps {
	mode: 'markdown';
	getMarkdown?: () => string;
	setMarkdown?: (text: string) => void;
	initialMarkdown?: string | null;
	excludedToolbarItems?: string[];
	variables?: string[];
	height?: string;
	placeholder?: string;
	disableLists?: boolean;
	updateTemplate?: boolean;
	firstRender?: boolean;
	setFirstRender?: Dispatch<SetStateAction<boolean>>;
	editorState?: InitialEditorStateType;
	editable?: boolean;
}

const editorConfig: InitialConfigType = {
	theme: ExampleTheme,
	onError(error: Error) {
		throw error;
	},
	namespace: '',
	nodes: [
		HeadingNode,
		ListNode,
		ListItemNode,
		QuoteNode,
		CodeNode,
		CodeHighlightNode,
		TableNode,
		TableCellNode,
		TableRowNode,
		AutoLinkNode,
		LinkNode,
	],
};

export const Editor = (props: TextEditorProps) => {
	const editable = props.editable ?? true;

	const transformers = props.disableLists
		? TRANSFORMERS.filter((value, index) => {
				if (index !== 3 && index !== 4) return value;
			})
		: TRANSFORMERS;

	const editorState = () =>
		$convertFromMarkdownString(props.initialMarkdown ?? '', transformers);

	return (
		<div className='editor rounded-md'>
			<LexicalComposer
				initialConfig={{
					...editorConfig,
					editable,
					editorState,
				}}
			>
				<div className='editor-container hover:border-emphasis focus-within:ring-brand-default rounded-md p-0 focus-within:ring-2'>
					<ToolbarPlugin
						editable={editable}
						transformers={transformers}
						excludedToolbarItems={props.excludedToolbarItems}
						variables={props.variables}
					/>
					<div
						className={cn('editor-inner scroll-bar', !editable && '!bg-subtle')}
						style={{ height: props.height }}
					>
						<RichTextPlugin
							contentEditable={
								<ContentEditable
									readOnly={!editable}
									style={{ height: props.height }}
									className='editor-input'
								/>
							}
							placeholder={
								props?.placeholder ? (
									<div className='-mt-11 p-3 text-sm text-muted'>{props.placeholder}</div>
								) : null
							}
							ErrorBoundary={LexicalErrorBoundary}
						/>
						<ListPlugin />
						<LinkPlugin />
						<AutoLinkPlugin />
						<HistoryPlugin />
						<MarkdownShortcutPlugin transformers={transformers} />
						{!!props.setMarkdown && !!props.getMarkdown && (
							<MarkdownInOutPlugin
								updateTemplate={props.updateTemplate}
								setMarkdown={props.setMarkdown}
								getMarkdown={props.getMarkdown}
								transformers={transformers}
							/>
						)}
					</div>
				</div>
			</LexicalComposer>
		</div>
	);
};
