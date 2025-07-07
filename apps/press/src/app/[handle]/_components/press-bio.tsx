import { mdxCard } from '@barely/ui/mdx-card';
import { mdxGrid } from '@barely/ui/mdx-grid';
import { mdxImageFile } from '@barely/ui/mdx-image-file';
import { mdxLink } from '@barely/ui/mdx-link';
import { mdxLinkButton } from '@barely/ui/mdx-link-button';
import { MDXRemote } from '@barely/ui/mdx-remote';
import { mdxTypography } from '@barely/ui/mdx-typography';
import { mdxVideoPlayer } from '@barely/ui/mdx-video-player';

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
