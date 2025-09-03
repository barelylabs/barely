'use client';

import { useSearchParams } from 'next/navigation';

import { DashContent } from '~/app/[handle]/_components/dash-content';
import { DashContentHeader } from '~/app/[handle]/_components/dash-content-header';
import { BioImagePage } from '../../_components/bio-image-page';

export default function ImagePage() {
	const searchParams = useSearchParams();
	const blockId = searchParams.get('blockId');

	return (
		<>
			<DashContentHeader title='Image' subtitle='Manage your bio page image' />
			<DashContent>
				{blockId ?
					<BioImagePage blockId={blockId} />
				:	<div>Please select an image block from the blocks page</div>}
			</DashContent>
		</>
	);
}
