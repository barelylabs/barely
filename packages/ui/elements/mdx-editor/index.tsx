'use client';

import type { MDXEditorMethods, MDXEditorProps } from '@mdxeditor/editor';
import { forwardRef } from 'react';
import dynamic from 'next/dynamic';

import { Skeleton } from '../skeleton';

export type { MDXEditorMethods, MDXEditorProps };
// ForwardRefEditor.tsx

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
				{/* <Skeleton className='h-8 w-full' /> */}
			</div>
		),
	},
);

// This is what is imported by other components. Pre-initialized with plugins, and ready
// to accept other props, including a ref.
export const MDXEditor = forwardRef<MDXEditorMethods, MDXEditorProps>(
	({ ...props }, ref) => <Editor {...props} className='' editorRef={ref} />,
);

// TS complains without the following line
MDXEditor.displayName = 'MDXEditor';
