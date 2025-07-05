import { mdxCard } from '@barely/ui/mdx-card';
import { mdxGrid } from '@barely/ui/mdx-grid';
import { mdxImageFile } from '@barely/ui/mdx-image-file';
import { mdxLink } from '@barely/ui/mdx-link';
import { mdxLinkButton } from '@barely/ui/mdx-link-button';
import { MDXRemote } from '@barely/ui/mdx-remote';
import { mdxTypography } from '@barely/ui/mdx-typography';
import { mdxVideoPlayer } from '@barely/ui/mdx-video-player';

// import { H } from '@barely/ui/typography';
// import { VideoPlayer } from '@barely/ui/video-player';

import { Section, SectionDiv } from '~/app/[handle]/_components/press-section';

export async function PressBio({ bio }: { bio: string }) {
	const components = {
		...mdxTypography,
		...mdxVideoPlayer,
		...mdxImageFile(),
		...mdxLink,
		...mdxLinkButton,
		...mdxCard,
		...mdxGrid,
	};

	const renderedBio = await MDXRemote({ source: bio, components });

	return (
		<Section id='bio'>
			<SectionDiv title='Bio'>
				<>{renderedBio}</>
			</SectionDiv>
		</Section>
	);
}
