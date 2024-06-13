import { MDXRemote } from '@barely/ui/elements/mdx';
import { mdxTypography } from '@barely/ui/elements/mdx-typography';
import { mdxVideoPlayer } from '@barely/ui/elements/mdx-video-player';

export function CartMDX({ markdown }: { markdown: string }) {
	const components = {
		...mdxTypography,
		...mdxVideoPlayer,
	};

	return <MDXRemote source={markdown} components={components} />;
}
