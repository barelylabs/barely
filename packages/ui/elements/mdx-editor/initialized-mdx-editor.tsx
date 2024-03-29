'use client';

import '@mdxeditor/editor/style.css';

// InitializedMDXEditor.tsx
import type {
	JsxComponentDescriptor,
	MDXEditorMethods,
	MDXEditorProps,
} from '@mdxeditor/editor';
import type { ForwardedRef } from 'react';
import {
	BlockTypeSelect,
	BoldItalicUnderlineToggles,
	Button,
	CreateLink,
	GenericJsxEditor,
	headingsPlugin,
	insertJsx$,
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
	usePublisher,
} from '@mdxeditor/editor';

import { Icon } from '../icon';
import { VideoPlayer } from '../video-player';

const jsxComponentDescriptors: JsxComponentDescriptor[] = [
	{
		name: 'VideoPlayer',
		kind: 'text',
		props: [
			{
				name: 'url',
				type: 'string',
			},
		],
		Editor: props => {
			const videoUrl = props.mdastNode.attributes.find(
				a => a.type === 'mdxJsxAttribute' && a.name === 'url',
			)?.value;

			return (
				<div className='mx-auto h-fit w-full'>
					<div className='flex w-full flex-col'>
						{typeof videoUrl === 'string' && (
							<VideoPlayer className='w-full' controls={false} url={videoUrl} />
						)}
						<GenericJsxEditor {...props} />
					</div>
				</div>
			);
		},
	},
];

const InsertVideo = () => {
	const insertJsx = usePublisher(insertJsx$);
	return (
		<Button
			onClick={() =>
				insertJsx({
					name: 'VideoPlayer',
					kind: 'text',
					props: { url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
				})
			}
		>
			<Icon.video className='h-5 w-5' weight='fill' />
		</Button>
	);
};

// Only import this to the next file
export function InitializedMDXEditor({
	editorRef,
	...props
}: { editorRef: ForwardedRef<MDXEditorMethods> | null } & MDXEditorProps) {
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
				jsxPlugin({ jsxComponentDescriptors }),

				toolbarPlugin({
					toolbarContents: () => (
						<>
							<UndoRedo />
							<BlockTypeSelect />
							<ListsToggle />
							<BoldItalicUnderlineToggles />
							<CreateLink />
							<InsertVideo />
						</>
					),
				}),
			]}
			contentEditableClassName='prose'
			{...props}
		/>
	);
}
