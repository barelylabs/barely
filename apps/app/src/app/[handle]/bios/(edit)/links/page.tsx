'use client';

import { useSearchParams } from 'next/navigation';
import { useWorkspace } from '@barely/hooks';

import { DashContent } from '~/app/[handle]/_components/dash-content';
import { DashContentHeader } from '~/app/[handle]/_components/dash-content-header';
import { BioLinksPage } from '../../_components/bio-links-page';

export default function LinksPage() {
	const { handle } = useWorkspace();
	const searchParams = useSearchParams();
	const blockId = searchParams.get('blockId');

	return (
		<>
			<DashContentHeader title='Links' subtitle='Manage your bio page links' />
			<DashContent>
				{blockId ?
					<BioLinksPage handle={handle} blockId={blockId} />
				:	<div>Please select a link block from the blocks page</div>}
			</DashContent>
		</>
	);
}
