import type { CartFunnel } from '@barely/lib/server/routes/cart-funnel/cart-funnel.schema';
import type { Link } from '@barely/lib/server/routes/link/link.schema';
import type { PressKit } from '@barely/lib/server/routes/press-kit/press-kit.schema';
import type { Metadata } from 'next';
import { getLandingPageData } from '@barely/lib/server/routes/landing-page/landing-page.render.fns';
import { getAssetHref } from '@barely/lib/utils/mdx';
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
		<div className='mx-auto flex min-h-screen w-full max-w-3xl flex-col items-center gap-6 px-4 py-10'>
			{cartFunnels?.length > 0 && <WarmupCart />}
			<MDXRemote
				source={lp.content ?? ''}
				components={{
					...mdxTypography,
					...mdxVideoPlayer,
					...mdxAssetButton({
						landingPageId: lp.id,
						cartFunnels,
						links,
						pressKits,
					}),
					...mdxLinkButton({ landingPageId: lp.id }),
				}}
			/>
			<LogVisit landingPageId={lp.id} />
		</div>
	);
}

function mdxLinkButton({ landingPageId }: { landingPageId: string }) {
	const LinkButton = ({ href, label }: { href: string; label: string }) => (
		<div className='flex w-full flex-col items-center'>
			<LandingPageLinkButton landingPageId={landingPageId} href={href} label={label} />
		</div>
	);

	return {
		LinkButton,
	};
}

function mdxAssetButton({
	landingPageId,
	cartFunnels,
	links,
	pressKits,
}: {
	landingPageId: string;
	cartFunnels: CartFunnel[];
	links: Link[];
	pressKits: PressKit[];
}) {
	const AssetButton = ({ assetId, label }: { assetId: string; label: string }) => {
		const href = getAssetHref({
			assetId,
			cartFunnels,
			links,
			pressKits,
			refererId: landingPageId,
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
