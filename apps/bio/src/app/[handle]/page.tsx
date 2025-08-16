import { Suspense } from 'react';

import { prefetch, trpc, trpcCaller } from '../../trpc/server';
import { BioPageRender } from './bio-page';

interface BioRouteProps {
	params: { handle: string };
}

export const revalidate = 60; // ISR: revalidate every 60 seconds
export const dynamic = 'force-static';

export default function BioRoute({ params }: BioRouteProps) {
	prefetch(trpc.bio.byHandle.queryOptions({ handle: params.handle }));

	return (
		<Suspense fallback={<div>Loading...</div>}>
			<BioPageRender />
		</Suspense>
	);
	// try {
	// 	const bio = await api.bio.byHandle({ handle: params.handle });

	// 	return <BioPageRender bio={bio} />;
	// } catch (error) {
	// 	console.error('Bio not found:', params.handle, error);
	// 	notFound();
	// }
}

export async function generateMetadata({ params }: BioRouteProps) {
	try {
		const bio = await trpcCaller.bio.byHandle({ handle: params.handle });

		const title = `${bio.workspace.name || bio.handle} - Bio`;

		const description = `Links and content from ${bio.workspace.name || bio.handle}`;

		return {
			title,
			description,
			openGraph: {
				title,
				description,
				...(bio.workspace.imageUrl && {
					images: [
						{
							url: bio.workspace.imageUrl,
							width: 400,
							height: 400,
							alt: `${bio.workspace.name || bio.handle} profile picture`,
						},
					],
				}),
			},
			twitter: {
				card: 'summary',
				title,
				description,
				...(bio.workspace.imageUrl && {
					images: [bio.workspace.imageUrl],
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
