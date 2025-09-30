'use client';

import '@mdxeditor/editor/style.css';
import './mdx-editor-overrides.css';

import type { MDXEditorMethods } from '@mdxeditor/editor';
import type { ForwardedRef } from 'react';
import { cn } from '@barely/utils';
import {
	BoldItalicUnderlineToggles,
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
} from '@mdxeditor/editor';

import type { MDXEditorProps } from '.';
import { variablePlugin } from './nodes/variable-node';
import { addVariablesPlugin } from './plugins/add-variables-plugin';
import { BlockTypeSelect } from './plugins/block-type-select';
import { LinkDialog } from './plugins/link-dialog/link-dialog';
import {
	buttonComponentDescriptors,
	InsertAssetButtonButton,
	InsertLinkButtonButton,
} from './plugins/mdx-button-plugin';
import { InsertCard, InsertGrid, mdxGridPlugin } from './plugins/mdx-grid-plugin';
import {
	imageFileJsxComponentDescriptors,
	InsertImageFileButton,
} from './plugins/mdx-image-file-plugin';
import {
	InsertVideoButton,
	videoJsxComponentDescriptors,
} from './plugins/mdx-video-plugin';

interface ToolbarOptions {
	lists?: boolean; // Bulleted, numbered, checkbox lists
	formatting?: boolean; // Bold, italic, underline
	divs?: boolean; // Grids and cards
	links?: boolean; // Video and link buttons
	barely?: boolean; // Image file and asset buttons
	headings?: boolean; // Heading selector
	undoRedo?: boolean; // Undo/redo buttons
}

// Only import this to the next file
export function InitializedMDXEditor({
	editorRef,
	className,
	toolbarOptions = {
		lists: true,
		formatting: true,
		divs: true,
		links: true,
		barely: true,
		headings: true,
		undoRedo: true,
	},
	...props
}: {
	editorRef: ForwardedRef<MDXEditorMethods> | null;
	toolbarOptions?: ToolbarOptions;
} & MDXEditorProps) {
	return (
		<div className='relative w-full max-w-full overflow-hidden rounded-lg border border-border bg-background p-4 pb-0'>
			<div
				className='mdx-editor-wrapper relative w-full max-w-full'
				style={
					{
						'--mdx-toolbar-max-width': '100%',
					} as React.CSSProperties
				}
			>
				<MDXEditor
					ref={editorRef}
					plugins={[
						headingsPlugin(),
						listsPlugin(),
						quotePlugin(),
						variablePlugin(),
						addVariablesPlugin(),
						linkPlugin(),
						linkDialogPlugin({
							LinkDialog: () => <LinkDialog />,
						}),
						thematicBreakPlugin(),
						markdownShortcutPlugin(),
						jsxPlugin({
							jsxComponentDescriptors: [
								...videoJsxComponentDescriptors,
								...buttonComponentDescriptors,
								...imageFileJsxComponentDescriptors,
								...mdxGridPlugin,
							],
						}),

						toolbarPlugin({
							toolbarContents: () => (
								<>
									{toolbarOptions.undoRedo && <UndoRedo />}
									{toolbarOptions.headings && <BlockTypeSelect />}
									{toolbarOptions.lists && <ListsToggle />}
									{toolbarOptions.formatting && <BoldItalicUnderlineToggles />}

									{toolbarOptions.divs && (
										<div className='mx-2 flex flex-shrink-0 flex-row items-center'>
											<InsertGrid />
											<InsertCard />
										</div>
									)}

									{toolbarOptions.links && (
										<div className='mx-2 flex flex-shrink-0 flex-row items-center'>
											<InsertVideoButton />
											<InsertLinkButtonButton />
										</div>
									)}

									{toolbarOptions.barely && (
										<div className='mx-2 flex flex-shrink-0 flex-row items-center'>
											<InsertImageFileButton />
											<InsertAssetButtonButton />
										</div>
									)}
								</>
							),
						}),
					]}
					{...props}
					contentEditableClassName='prose prose-sm max-w-none w-full [&>*]:max-w-full'
					className={cn(
						'w-full max-w-full [&_.cm-content]:max-w-full [&_.cm-scroller]:max-w-full',
						className,
					)}
				/>
			</div>
		</div>
	);
}
