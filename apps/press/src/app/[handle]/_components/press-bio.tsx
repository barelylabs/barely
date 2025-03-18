// import type { ReactNode } from 'react';

import { MDXRemote } from '@barely/ui/elements/mdx';
import { mdxCard } from '@barely/ui/elements/mdx-card';
import { mdxGrid } from '@barely/ui/elements/mdx-grid';
import { mdxImageFile } from '@barely/ui/elements/mdx-image-file';
import { mdxLink } from '@barely/ui/elements/mdx-link';
import { mdxLinkButton } from '@barely/ui/elements/mdx-link-button';
import { mdxTypography } from '@barely/ui/elements/mdx-typography';
import { mdxVideoPlayer } from '@barely/ui/elements/mdx-video-player';

// import { H } from '@barely/ui/elements/typography';
// import { VideoPlayer } from '@barely/ui/elements/video-player';

import { Section, SectionDiv } from '~/app/[handle]/_components/press-section';

export function PressBio({ bio }: { bio: string }) {
	const components = {
		...mdxTypography,
		...mdxVideoPlayer,
		...mdxImageFile(),
		...mdxLink,
		...mdxLinkButton,
		...mdxCard,
		...mdxGrid,
	};

	return (
		<Section id='bio'>
			<SectionDiv title='Bio'>
				<MDXRemote source={bio} components={components} />
			</SectionDiv>
		</Section>
	);
}
