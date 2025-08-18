import { Suspense } from 'react';

import { s3Loader } from '@barely/ui/img';

import { prefetch, trpc, trpcCaller } from '../../trpc/server';
import { BioBioRender } from './bio-bio-render';

interface BioRouteProps {
	params: { handle: string };
}

export const revalidate = 60; // ISR: revalidate every 60 seconds
export const dynamic = 'force-static';

export default async function BioPage({
	params,
}: {
	params: Promise<{ handle: string }>;
}) {
	const { handle } = await params;

	const brandKit = await trpcCaller.bio.brandKitByHandle({ handle });

	prefetch(trpc.bio.byHandleAndKey.queryOptions({ handle, key: 'home' }));

	return (
		<Suspense fallback={<div>Loading...</div>}>
			<BioBioRender handle={handle} bioKey={'home'} brandKit={brandKit} />
		</Suspense>
	);
}

export async function generateMetadata({ params }: BioRouteProps) {
	try {
		const bio = await trpcCaller.bio.byHandleAndKey({ handle: params.handle });
		const brandKit = await trpcCaller.bio.brandKitByHandle({ handle: params.handle });

		const title = `${bio.handle} - Bio`;
		const description = `Links and content from ${bio.handle}`;
		const imageUrl =
			brandKit.avatarS3Key ? s3Loader({ s3Key: brandKit.avatarS3Key, width: 400 }) : null;

		return {
			title,
			description,
			openGraph: {
				title,
				description,
				...(imageUrl && {
					images: [
						{
							url: imageUrl,
							width: 400,
							height: 400,
							alt: `${bio.handle} profile picture`,
						},
					],
				}),
			},
			twitter: {
				card: 'summary',
				title,
				description,
				...(imageUrl && {
					images: [imageUrl],
				}),
			},
		};
	} catch {
		return {
			title: 'Bio Page - barely.bio',
			description: 'Link in bio page',
		};
	}
}
