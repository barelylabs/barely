import type { ReactNode } from 'react';

import { MDXRemote } from '@barely/ui/elements/mdx';
import { H, Text } from '@barely/ui/elements/typography';
import { VideoPlayer } from '@barely/ui/elements/video-player';

export function CartMDX({ markdown }: { markdown: string }) {
	const components = {
		p: ({ children }: { children?: ReactNode }) => (
			<Text variant='lg/normal' className='text-center'>
				{children}
			</Text>
		),
		h1: ({ children }: { children?: ReactNode }) => <H size='1'>{children}</H>,
		h2: ({ children }: { children?: ReactNode }) => <H size='2'>{children}</H>,
		h3: ({ children }: { children?: ReactNode }) => <H size='3'>{children}</H>,
		h4: ({ children }: { children?: ReactNode }) => <H size='4'>{children}</H>,
		h5: ({ children }: { children?: ReactNode }) => <H size='5'>{children}</H>,

		VideoPlayer: ({ url }: { url: string }) => (
			<div className='mx-auto h-fit w-full'>
				<VideoPlayer className='w-full' url={url} />
			</div>
		),
	};

	return <MDXRemote source={markdown} components={components} />;
}
