'use client';

import { DashContent } from '~/app/[handle]/_components/dash-content';
import { DashContentHeader } from '~/app/[handle]/_components/dash-content-header';
import { useBioQueryState } from '~/app/[handle]/bios/_hooks/use-bio-query-state';
import { BioBlocksPage } from '../../_components/bio-blocks-page';

export default function BlocksPage() {
	const { bioKey } = useBioQueryState();

	return (
		<>
			<DashContentHeader
				title='Bio Blocks'
				subtitle='Rearrange and toggle blocks for your bio page'
			/>
			<DashContent>
				<BioBlocksPage bioKey={bioKey} />
			</DashContent>
		</>
	);
}
