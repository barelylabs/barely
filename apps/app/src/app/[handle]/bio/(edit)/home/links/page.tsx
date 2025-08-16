import type { Metadata } from 'next';
import { Suspense } from 'react';
import { redirect } from 'next/navigation';

import { DashContent } from '~/app/[handle]/_components/dash-content';
import { DashContentHeader } from '~/app/[handle]/_components/dash-content-header';
import { BioLinksPage } from '../../../_components/bio-links-page';

export const metadata: Metadata = {
	title: 'Bio - Edit Links',
	description: 'Manage links within your bio block',
};

export default async function LinksPage({
	params,
	searchParams,
}: {
	params: Promise<{ handle: string }>;
	searchParams: Promise<{ blockId?: string }>;
}) {
	const { handle } = await params;
	const { blockId } = await searchParams;

	if (!blockId) {
		redirect(`/${handle}/bio/home/blocks`);
	}

	return (
		<>
			<DashContentHeader title='Edit Links' subtitle='Manage links in this block' />
			<DashContent>
				<Suspense fallback={<div>Loading...</div>}>
					<BioLinksPage handle={handle} blockId={blockId} />
				</Suspense>
			</DashContent>
		</>
	);
}
