'use client';

import type {
	MDXEditorMethods,
	MDXEditorProps as MDXEditorPropsBase,
} from '@mdxeditor/editor';
import { forwardRef } from 'react';
import dynamic from 'next/dynamic';

import { Skeleton } from '../skeleton';

export type { MDXEditorMethods };

export interface ToolbarOptions {
	lists?: boolean; // Bulleted, numbered, checkbox lists
	formatting?: boolean; // Bold, italic, underline
	divs?: boolean; // Grids and cards
	links?: boolean; // Video and link buttons
	barely?: boolean; // Image file and asset buttons
	headings?: boolean; // Heading selector
	undoRedo?: boolean; // Undo/redo buttons
}

export interface MDXEditorProps extends MDXEditorPropsBase {
	variables?: readonly {
		name: string;
		description: string;
	}[];
	toolbarOptions?: ToolbarOptions;
}

// This is the only place InitializedMDXEditor is imported directly.
const Editor = dynamic(
	() => import('./initialized-mdx-editor').then(mod => mod.InitializedMDXEditor),
	{
		// Make sure we turn SSR off
		ssr: false,
		loading: () => (
			<div className='flex h-96 w-full flex-col gap-2 p-4'>
				<Skeleton className='h-8 w-full' />
				<Skeleton className='h-8 w-full' />
				<Skeleton className='h-8 w-full' />
			</div>
		),
	},
);

// This is what is imported by other components. Pre-initialized with plugins, and ready
// to accept other props, including a ref.
export const MDXEditor = forwardRef<MDXEditorMethods, MDXEditorProps>(
	({ toolbarOptions, ...props }, ref) => (
		<Editor {...props} className='' editorRef={ref} toolbarOptions={toolbarOptions} />
	),
);

// TS complains without the following line
MDXEditor.displayName = 'MDXEditor';
