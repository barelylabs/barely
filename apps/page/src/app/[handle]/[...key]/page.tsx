import type { CartFunnel } from '@barely/lib/server/routes/cart-funnel/cart-funnel.schema';
import type { LandingPage } from '@barely/lib/server/routes/landing-page/landing-page.schema';
import type { Link } from '@barely/lib/server/routes/link/link.schema';
import type { PressKit } from '@barely/lib/server/routes/press-kit/press-kit.schema';
import type { Metadata } from 'next';
import type { z } from 'zod';
import { eventReportSearchParamsSchema } from '@barely/lib/server/routes/event/event-report.schema';
import { getLandingPageData } from '@barely/lib/server/routes/landing-page/landing-page.render.fns';
import { getAssetHref, getLinkHref } from '@barely/lib/utils/mdx';
import { MDXRemote } from 'next-mdx-remote/rsc';

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

	const { fbclid, fanId } = searchParamsSafe.data ?? {};

	const data = await getLandingPageData({
		handle: params.handle,
		key: key,
	});

	if (!data) {
		return <div>Not found</div>;
	}

	const { cartFunnels, links, pressKits, landingPages, ...lp } = data;

	return (
		<div className='mx-auto flex min-h-screen w-full max-w-3xl flex-col items-center gap-6 px-4 py-10'>
			{cartFunnels?.length > 0 && <WarmupCart />}
			<MDXRemote
				source={lp.content ?? ''}
				components={{
					...mdxTypography,
					...mdxVideoPlayer,
					...mdxAssetButton({
						landingPageId: lp.id,
						// assets
						cartFunnels,
						links,
						pressKits,
						landingPages,
						// tracking
						fbclid,
						fanId,
					}),
					...mdxLinkButton({ landingPageId: lp.id, fbclid, fanId }),
				}}
			/>
			<LogVisit landingPageId={lp.id} />
		</div>
	);
}

function mdxLinkButton({
	landingPageId,
	fbclid,
	fanId,
}: {
	landingPageId: string;
	fbclid?: string;
	fanId?: string;
}) {
	const LinkButton = (props: { href: string; label: string }) => {
		const href = getLinkHref({
			href: props.href,
			refererId: landingPageId,
			fbclid,
			fanId,
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

function mdxAssetButton({
	landingPageId,
	cartFunnels,
	landingPages,
	links,
	pressKits,
	// tracking
	fbclid,
	fanId,
}: {
	landingPageId: string;
	cartFunnels: CartFunnel[];
	landingPages: LandingPage[];
	links: Link[];
	pressKits: PressKit[];
	// tracking
	fbclid?: string;
	fanId?: string;
}) {
	const AssetButton = ({ assetId, label }: { assetId: string; label: string }) => {
		const href = getAssetHref({
			assetId,
			cartFunnels,
			landingPages,
			links,
			pressKits,
			refererId: landingPageId,
			fbclid,
			fanId,
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
