import { MDXRemote } from '@barely/ui/elements/mdx';
import { mdxImageFile } from '@barely/ui/elements/mdx-image-file';
import { mdxLink } from '@barely/ui/elements/mdx-link';
import { mdxVideoPlayer } from '@barely/ui/elements/mdx-video-player';

import { blogTypography } from './BlogTypography';

export function BlogMDX({ markdown }: { markdown: string }) {
  const components = {
    ...blogTypography,
    ...mdxVideoPlayer,
    ...mdxImageFile(),
    ...mdxLink,
  };

  return (
    <article className="prose prose-invert max-w-none">
      <MDXRemote source={markdown} components={components} />
    </article>
  );
}