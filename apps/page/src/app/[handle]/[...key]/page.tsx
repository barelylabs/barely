import type { MdxImageSize } from '@barely/lib/server/mdx/mdx.constants';
import type { EventTrackingProps } from '@barely/lib/server/routes/event/event-report.schema';
import type { LandingPage } from '@barely/lib/server/routes/landing-page/landing-page.schema';
import type { MdxAssets } from '@barely/lib/utils/mdx';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import type { z } from 'zod';
import { MDX_IMAGE_SIZE_TO_WIDTH } from '@barely/lib/server/mdx/mdx.constants';
import { eventReportSearchParamsSchema } from '@barely/lib/server/routes/event/event-report.schema';
import { getLandingPageData } from '@barely/lib/server/routes/landing-page/landing-page.render.fns';
import { cn } from '@barely/lib/utils/cn';
import { getAssetHref, getLinkHref } from '@barely/lib/utils/mdx';
import { MDXRemote } from 'next-mdx-remote/rsc';

import { Button } from '@barely/ui/elements/button';
import { Img } from '@barely/ui/elements/img';
import { mdxCard } from '@barely/ui/elements/mdx-card';
import { mdxGrid } from '@barely/ui/elements/mdx-grid';
import { mdxTypography } from '@barely/ui/elements/mdx-typography';
import { mdxVideoPlayer } from '@barely/ui/elements/mdx-video-player';

import { LandingPageLinkButton } from '~/app/[handle]/[...key]/lp-link-button';
import { LogVisit } from '~/app/[handle]/[...key]/lp-log-visit';
import { WarmupCart } from '~/app/[handle]/[...key]/warmup-cart';

export async function generateMetadata({
	params,
}: {
	params: { handle: string; key: string[] };
}): Promise<Metadata> {
	const data = await getLandingPageData({
		handle: params.handle,
		key: params.key.join('/'),
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
	params: { handle: string; key: string[] };
	searchParams: z.infer<typeof eventReportSearchParamsSchema>;
}) {
	const key = params.key.join('/');

	const searchParamsSafe = eventReportSearchParamsSchema.safeParse(searchParams);

	const data = await getLandingPageData({
		handle: params.handle,
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

	return (
		<div className='mx-auto flex min-h-screen w-full max-w-[824px] flex-col items-center gap-12 px-4 py-10 sm:gap-[3.25rem] sm:px-6 sm:py-12 md:gap-14'>
			{cartFunnels?.length > 0 && <WarmupCart />}
			<MDXRemote
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
			/>
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

function mdxImageFile() {
	const ImageFile = ({
		s3Key,
		alt,
		width,
		height,
		size = 'md',
	}: {
		s3Key: string;
		alt: string;
		width: number;
		height: number;
		size: MdxImageSize;
	}) => {
		const adjustedWidth = MDX_IMAGE_SIZE_TO_WIDTH[size];
		const aspectRatio = width / height;
		const adjustedHeight = Math.round(adjustedWidth / aspectRatio);

		return (
			<Img
				s3Key={s3Key}
				alt={alt}
				width={adjustedWidth}
				height={adjustedHeight}
				className={cn(
					'rounded-md',
					size === 'xs' && 'max-w-[min(100%,200px)]',
					size === 'sm' && 'max-w-[min(100%,18rem)]', // 18rem = 288px (max-w-xs)
					size === 'md' && 'max-w-[min(100%,24rem)]', // 24rem = 384px (max-w-sm)
					size === 'lg' && 'max-w-[min(100%,28rem)]', // 28rem = 448px (max-w-md)
					size === 'xl' && 'max-w-[min(100%,32rem)]', // 32rem = 512px (max-w-lg)
				)}
			/>
		);
	};

	return {
		ImageFile,
	};
}

function mdxLink({ tracking }: { tracking: EventTrackingProps }) {
	const MdxLandingPageLink = ({
		href,
		children,
	}: {
		href?: string;
		children?: ReactNode;
	}) => {
		const hrefWithQueryParams = href ? getLinkHref({ href, tracking }) : '';
		return (
			<Button look='link' href={hrefWithQueryParams}>
				{children}
			</Button>
		);
	};

	return {
		a: MdxLandingPageLink,
	};
}
