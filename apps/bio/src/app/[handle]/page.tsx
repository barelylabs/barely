import { Suspense } from 'react';

import { s3Loader } from '@barely/ui/img';

import { fetchBio, fetchBrandKit } from '../../trpc/server';
import { BioBioRender } from './bio-bio-render';

interface BioRouteProps {
	params: Promise<{ handle: string }>;
}

export const revalidate = 60; // ISR: revalidate every 60 seconds
// Remove force-static to allow cookie handling for visitor tracking
// export const dynamic = 'force-static';

export default async function BioPage({ params }: BioRouteProps) {
	const { handle } = await params;

	// Fetch brandKit - this will be cached if already fetched in layout
	const brandKit = await fetchBrandKit(handle);
	const bio = await fetchBio({ handle, key: 'home' });

	// prefetch(trpc.bio.byHandleAndKey.queryOptions({ handle, key: 'home' }));

	return (
		<Suspense fallback={<div>Loading...</div>}>
			<BioBioRender bio={bio} brandKit={brandKit} />
		</Suspense>
	);
}

export async function generateMetadata({ params }: BioRouteProps) {
	try {
		const { handle } = await params;
		const bio = await fetchBio({ handle, key: 'home' });
		const brandKit = await fetchBrandKit(handle);

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
