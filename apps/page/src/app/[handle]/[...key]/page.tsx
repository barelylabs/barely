import type { Metadata } from 'next';
import { getLandingPageData } from '@barely/lib/server/routes/landing-page/landing-page.render.fns';
import { MDXRemote } from 'next-mdx-remote/rsc';

import { mdxAssetButton } from '@barely/ui/elements/mdx-asset-button';
import { mdxTypography } from '@barely/ui/elements/mdx-typography';
import { mdxVideoPlayer } from '@barely/ui/elements/mdx-video-player';

export async function generateMetadata({
	params,
}: {
	params: { handle: string; key: string[] };
}): Promise<Metadata> {
	const data = await getLandingPageData({
		handle: params.handle,
		key: params.key.join('/'),
	});

	// console.log(data);

	if (!data) {
		return {
			title: 'barely.page',
		};
	}

	return {
		title: data.metaTitle,
		description: data.metaDescription,
		openGraph: {
			...(data.metaTitle && { title: data.metaTitle }),
			...(data.metaDescription && { description: data.metaDescription }),
			...(data.metaImage && { image: data.metaImage }),
		},
	};
}

export default async function LandingPage({
	params,
}: {
	params: { handle: string; key: string[] };
}) {
	const key = params.key.join('/');

	const data = await getLandingPageData({
		handle: params.handle,
		key: key,
	});

	if (!data) {
		return <div>Not found</div>;
	}

	const { cartFunnels, links, pressKits, ...lp } = data;

	return (
		<div className='mx-auto flex min-h-screen w-full max-w-7xl flex-col items-center gap-6 px-4 py-10'>
			<MDXRemote
				source={lp.content ?? ''}
				components={{
					...mdxTypography,
					...mdxVideoPlayer,
					...mdxAssetButton({ cartFunnels, links, pressKits, refererId: data.id }),
				}}
			/>
		</div>
	);
}
