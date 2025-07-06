import type { MdxAssets } from '@barely/utils';
import type { EventTrackingProps, LandingPage } from '@barely/validators/schemas';
import type { Metadata } from 'next';
import type { z } from 'zod/v4';
import { getLandingPageData } from '@barely/lib/functions/landing-page.render.fns';
import { getAssetHref, getLinkHref } from '@barely/utils';
import { eventReportSearchParamsSchema } from '@barely/validators/schemas';
import { MDXRemote } from 'next-mdx-remote/rsc';

import { mdxCard } from '@barely/ui/mdx-card';
import { mdxGrid } from '@barely/ui/mdx-grid';
import { mdxImageFile } from '@barely/ui/mdx-image-file';
import { mdxLink } from '@barely/ui/mdx-link';
import { mdxTypography } from '@barely/ui/mdx-typography';
import { mdxVideoPlayer } from '@barely/ui/mdx-video-player';

import { LandingPageLinkButton } from '~/app/[handle]/[...key]/lp-link-button';
import { LogVisit } from '~/app/[handle]/[...key]/lp-log-visit';
import { WarmupCart } from '~/app/[handle]/[...key]/warmup-cart';

export async function generateMetadata({
	params,
}: {
	params: Promise<{ handle: string; key: string[] }>;
}): Promise<Metadata> {
	const awaitedParams = await params;
	const data = await getLandingPageData({
		handle: awaitedParams.handle,
		key: awaitedParams.key.join('/'),
	});

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
	searchParams,
}: {
	params: Promise<{ handle: string; key: string[] }>;
	searchParams: Promise<z.infer<typeof eventReportSearchParamsSchema>>;
}) {
	const awaitedParams = await params;
	const awaitedSearchParams = await searchParams;
	const key = awaitedParams.key.join('/');

	const searchParamsSafe = eventReportSearchParamsSchema.safeParse(awaitedSearchParams);

	const data = await getLandingPageData({
		handle: awaitedParams.handle,
		key: key,
	});

	if (!data) {
		return <div>Not found</div>;
	}

	const { cartFunnels, links, pressKits, landingPages, ...lp } = data;

	const tracking = {
		...searchParamsSafe.data,
		landingPageId: lp.id,
		refererId: lp.id,
	};

	const renderedMarkdown = await MDXRemote({
		source: lp.content ?? '',
		components: {
			...mdxTypography,
			...mdxVideoPlayer,
			...mdxLandingPageAssetButton({
				landingPageId: lp.id,
				assets: {
					cartFunnels,
					links,
					pressKits,
					landingPages,
				},
				tracking,
			}),
			...mdxLink({
				tracking,
			}),
			...mdxLinkButton({
				landingPageId: lp.id,
				tracking,
			}),
			...mdxImageFile(),
			...mdxGrid,
			...mdxCard,
		},
	});

	return (
		<div className='mx-auto flex min-h-screen w-full max-w-[824px] flex-col items-center gap-12 px-4 py-10 sm:gap-[3.25rem] sm:px-6 sm:py-12 md:gap-14'>
			{cartFunnels.length > 0 && <WarmupCart />}
			<>{renderedMarkdown}</>
			{/* <MDXRemote
				source={lp.content ?? ''}
				components={{
					...mdxTypography,
					...mdxVideoPlayer,
					...mdxLandingPageAssetButton({
						landingPageId: lp.id,
						assets: {
							cartFunnels,
							links,
							pressKits,
							landingPages,
						},
						tracking,
					}),
					...mdxLink({
						tracking,
					}),
					...mdxLinkButton({
						landingPageId: lp.id,
						tracking,
					}),
					...mdxImageFile(),
					...mdxGrid,
					...mdxCard,
				}}
			/> */}
			<LogVisit landingPageId={lp.id} />
		</div>
	);
}

function mdxLinkButton({
	landingPageId,
	tracking,
}: {
	landingPageId: string;
	tracking: EventTrackingProps;
}) {
	const LinkButton = (props: { href: string; label: string }) => {
		const href = getLinkHref({
			href: props.href,
			tracking,
		});
		return (
			<div className='flex w-full flex-col items-center'>
				<LandingPageLinkButton
					landingPageId={landingPageId}
					href={href}
					label={props.label}
				/>
			</div>
		);
	};

	return {
		LinkButton,
	};
}

function mdxLandingPageAssetButton({
	landingPageId,
	assets,
	tracking,
}: {
	landingPageId: string;
	assets: MdxAssets;
	tracking: EventTrackingProps;
}) {
	const AssetButton = ({ assetId, label }: { assetId: string; label: string }) => {
		const href = getAssetHref({
			assetId,
			assets,
			tracking,
		});

		return (
			<div className='flex w-full flex-col items-center'>
				<LandingPageLinkButton
					landingPageId={landingPageId}
					assetId={assetId}
					href={href}
					label={label}
				/>
			</div>
		);
	};

	return {
		AssetButton,
	};
}
