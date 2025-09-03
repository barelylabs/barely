'use client';

import { useSearchParams } from 'next/navigation';

import { DashContent } from '~/app/[handle]/_components/dash-content';
import { DashContentHeader } from '~/app/[handle]/_components/dash-content-header';
import { BioTwoPanelPage } from '../../_components/bio-two-panel-page';

export default function TwoPanelPage() {
	const searchParams = useSearchParams();
	const blockId = searchParams.get('blockId');

	return (
		<>
			<DashContentHeader
				title='Two Panel Layout'
				subtitle='Configure your two panel layout'
			/>
			<DashContent>
				{blockId ?
					<BioTwoPanelPage blockId={blockId} />
				:	<div>Please select a two panel block from the blocks page</div>}
			</DashContent>
		</>
	);
}
