'use client';

import '@mdxeditor/editor/style.css';

// InitializedMDXEditor.tsx
import type {
	// CodeBlockEditorDescriptor,
	// JsxComponentDescriptor,
	MDXEditorMethods,
	MDXEditorProps,
} from '@mdxeditor/editor';
import type { ForwardedRef } from 'react';
import { cn } from '@barely/lib/utils/cn';
import {
	// BlockTypeSelect,
	BoldItalicUnderlineToggles,
	codeMirrorPlugin,
	CreateLink,
	// GenericJsxEditor,
	headingsPlugin,
	jsxPlugin,
	linkDialogPlugin,
	linkPlugin,
	listsPlugin,
	ListsToggle,
	markdownShortcutPlugin,
	MDXEditor,
	quotePlugin,
	thematicBreakPlugin,
	toolbarPlugin,
	UndoRedo,
	// useCodeBlockEditorContext,
} from '@mdxeditor/editor';
import { useTheme } from 'next-themes';

import { BlockTypeSelect } from './plugins/block-type-select';
import {
	buttonComponentDescriptors,
	InsertAssetButtonButton,
	InsertLinkButtonButton,
} from './plugins/mdx-button-plugin';
import {
	InsertVideoButton,
	videoJsxComponentDescriptors,
} from './plugins/mdx-video-plugin';

// const PlainTextCodeEditorDescriptor: CodeBlockEditorDescriptor = {
// 	match: () => true,
// 	priority: 0,
// 	Editor: props => {
// 		const cb = useCodeBlockEditorContext();
// 		return (
// 			// eslint-disable-next-line jsx-a11y/no-static-element-interactions
// 			<div onKeyDown={e => e.nativeEvent.stopImmediatePropagation()}>
// 				<textarea
// 					rows={3}
// 					cols={20}
// 					defaultValue={props.code}
// 					onChange={e => cb.setCode(e.target.value)}
// 				/>
// 			</div>
// 		);
// 	},
// };

// Only import this to the next file
export function InitializedMDXEditor({
	editorRef,
	className,
	...props
}: { editorRef: ForwardedRef<MDXEditorMethods> | null } & MDXEditorProps) {
	const { theme } = useTheme();

	return (
		<MDXEditor
			ref={editorRef}
			plugins={[
				headingsPlugin(),
				listsPlugin(),
				quotePlugin(),
				linkPlugin(),
				linkDialogPlugin(),
				thematicBreakPlugin(),
				markdownShortcutPlugin(),
				// codeBlockPlugin({ codeBlockEditorDescriptors: [PlainTextCodeEditorDescriptor] }),
				codeMirrorPlugin({ codeBlockLanguages: { js: 'Javascript', ts: 'Typescript' } }),
				jsxPlugin({
					jsxComponentDescriptors: [
						...videoJsxComponentDescriptors,
						...buttonComponentDescriptors,
					],
				}),

				toolbarPlugin({
					toolbarContents: () => (
						<>
							<UndoRedo />
							{/* <BlockTypeSelect /> */}
							<BlockTypeSelect />
							<ListsToggle />
							<BoldItalicUnderlineToggles />
							<CreateLink />
							<InsertVideoButton />
							<InsertAssetButtonButton />
							<InsertLinkButtonButton />
						</>
					),
				}),
			]}
			{...props}
			contentEditableClassName='prose'
			className={cn(
				'rounded-lg border border-border bg-background p-4 text-red',
				theme === 'dark' && 'dark-theme',
				className,
			)}
		/>
	);
}
