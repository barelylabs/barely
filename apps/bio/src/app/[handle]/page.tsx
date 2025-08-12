import { notFound } from 'next/navigation';

import { api } from '../../trpc/server';
import { BioPage } from './bio-page';

interface BioRouteProps {
	params: { handle: string };
}

export const revalidate = 60; // ISR: revalidate every 60 seconds
export const dynamic = 'force-static';

export default async function BioRoute({ params }: BioRouteProps) {
	try {
		const bio = await api.bio.byHandle({ handle: params.handle });

		return <BioPage bio={bio} />;
	} catch (error) {
		console.error('Bio not found:', params.handle, error);
		notFound();
	}
}

export async function generateMetadata({ params }: BioRouteProps) {
	try {
		const bio = await api.bio.byHandle({ handle: params.handle });

		const title =
			bio.title ?
				`${bio.title} - ${bio.workspace.name || bio.handle}`
			:	`${bio.workspace.name || bio.handle} - Bio`;

		const description =
			bio.subtitle ?? `Links and content from ${bio.workspace.name || bio.handle}`;

		return {
			title,
			description,
			openGraph: {
				title,
				description,
				...(bio.img && {
					images: [
						{
							url: bio.img,
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
				...(bio.img && {
					images: [bio.img],
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
