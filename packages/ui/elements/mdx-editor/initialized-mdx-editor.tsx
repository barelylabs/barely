'use client';

import '@mdxeditor/editor/style.css';

// InitializedMDXEditor.tsx
import type {
	CodeBlockEditorDescriptor,
	JsxComponentDescriptor,
	MDXEditorMethods,
	MDXEditorProps,
} from '@mdxeditor/editor';
import type { ForwardedRef } from 'react';
import { cn } from '@barely/lib/utils/cn';
import {
	BlockTypeSelect,
	BoldItalicUnderlineToggles,
	Button,
	codeBlockPlugin,
	codeMirrorPlugin,
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
	useCodeBlockEditorContext,
	usePublisher,
} from '@mdxeditor/editor';
import { useTheme } from 'next-themes';

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

const PlainTextCodeEditorDescriptor: CodeBlockEditorDescriptor = {
	match: () => true,
	priority: 0,
	Editor: props => {
		const cb = useCodeBlockEditorContext();
		return (
			// eslint-disable-next-line jsx-a11y/no-static-element-interactions
			<div onKeyDown={e => e.nativeEvent.stopImmediatePropagation()}>
				<textarea
					rows={3}
					cols={20}
					defaultValue={props.code}
					onChange={e => cb.setCode(e.target.value)}
				/>
			</div>
		);
	},
};

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
				codeBlockPlugin({ codeBlockEditorDescriptors: [PlainTextCodeEditorDescriptor] }),
				codeMirrorPlugin({ codeBlockLanguages: { js: 'Javascript', ts: 'Typescript' } }),
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
