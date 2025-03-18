'use client';

import '@mdxeditor/editor/style.css';

import type { MDXEditorMethods } from '@mdxeditor/editor';
import type { ForwardedRef } from 'react';
import { cn } from '@barely/lib/utils/cn';
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

// Only import this to the next file
export function InitializedMDXEditor({
	editorRef,
	className,
	...props
}: { editorRef: ForwardedRef<MDXEditorMethods> | null } & MDXEditorProps) {
	return (
		<div className='relative rounded-lg border border-border bg-background p-4'>
			<div className='max-h-[70vh] overflow-y-auto'>
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
									<UndoRedo />
									<BlockTypeSelect />
									<ListsToggle />
									<BoldItalicUnderlineToggles />

									<div className='mx-2 flex flex-row items-center'>
										<InsertGrid />
										<InsertCard />
									</div>

									<div className='mx-2 flex flex-row items-center'>
										<InsertVideoButton />
										<InsertLinkButtonButton />
									</div>

									<div className='mx-2 flex flex-row items-center'>
										<InsertImageFileButton />
										<InsertAssetButtonButton />
									</div>
								</>
							),
						}),
					]}
					{...props}
					contentEditableClassName='prose'
					className={cn(className)}
				/>
			</div>
		</div>
	);
}
