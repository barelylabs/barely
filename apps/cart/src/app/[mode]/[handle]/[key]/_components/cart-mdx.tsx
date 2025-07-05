import { mdxCard } from '@barely/ui/mdx-card';
import { mdxGrid } from '@barely/ui/mdx-grid';
import { mdxImageFile } from '@barely/ui/mdx-image-file';
import { mdxLink } from '@barely/ui/mdx-link';
import { MDXRemote } from '@barely/ui/mdx-remote';
import { mdxTypography } from '@barely/ui/mdx-typography';
import { mdxVideoPlayer } from '@barely/ui/mdx-video-player';

export async function CartMDX({ markdown }: { markdown: string }) {
	const components = {
		...mdxTypography,
		...mdxVideoPlayer,
		...mdxImageFile(),
		...mdxGrid,
		...mdxCard,
		...mdxLink,
	};

	const renderedMarkdown = await MDXRemote({ source: markdown, components });

	return <>{renderedMarkdown}</>;
}
