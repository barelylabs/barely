'use client';

import { useSearchParams } from 'next/navigation';
import { useWorkspace } from '@barely/hooks';

import { DashContent } from '~/app/[handle]/_components/dash-content';
import { DashContentHeader } from '~/app/[handle]/_components/dash-content-header';
import { BioMarkdownPage } from '../../_components/bio-markdown-page';

export default function MarkdownPage() {
	const { handle } = useWorkspace();
	const searchParams = useSearchParams();
	const blockId = searchParams.get('blockId');

	return (
		<>
			<DashContentHeader title='Content' subtitle='Edit your bio page content' />
			<DashContent>
				{blockId ?
					<BioMarkdownPage handle={handle} blockId={blockId} />
				:	<div>Please select a markdown block from the blocks page</div>}
			</DashContent>
		</>
	);
}
