import type { ReactNode } from 'react';

import { MDXRemote } from '@barely/ui/elements/mdx';
import { H } from '@barely/ui/elements/typography';
import { VideoPlayer } from '@barely/ui/elements/video-player';

import { Section, SectionDiv } from '~/app/[handle]/_components/press-section';

export function PressBio({ bio }: { bio: string }) {
	const components = {
		p: ({ children }: { children?: ReactNode }) => (
			<p className='text-left text-sm sm:text-md'>{children}</p>
		),
		h1: ({ children }: { children?: ReactNode }) => <H size='1'>{children}</H>,
		h2: ({ children }: { children?: ReactNode }) => <H size='2'>{children}</H>,
		h3: ({ children }: { children?: ReactNode }) => <H size='3'>{children}</H>,
		h4: ({ children }: { children?: ReactNode }) => <H size='4'>{children}</H>,
		h5: ({ children }: { children?: ReactNode }) => <H size='5'>{children}</H>,

		VideoPlayer: ({ url }: { url: string }) => <VideoPlayer url={url} />,
	};

	return (
		<Section id='bio'>
			<SectionDiv title='Bio'>
				<MDXRemote source={bio} components={components} />
			</SectionDiv>
		</Section>
	);
}
