import { MDXRemote } from '@barely/ui/elements/mdx';
import { mdxCard } from '@barely/ui/elements/mdx-card';
import { mdxGrid } from '@barely/ui/elements/mdx-grid';
import { mdxImageFile } from '@barely/ui/elements/mdx-image-file';
import { mdxLink } from '@barely/ui/elements/mdx-link';
import { mdxTypography } from '@barely/ui/elements/mdx-typography';
import { mdxVideoPlayer } from '@barely/ui/elements/mdx-video-player';

export function CartMDX({ markdown }: { markdown: string }) {
	const components = {
		...mdxTypography,
		...mdxVideoPlayer,
		...mdxImageFile(),
		...mdxGrid,
		...mdxCard,
		...mdxLink,
	};

	return <MDXRemote source={markdown} components={components} />;
}
