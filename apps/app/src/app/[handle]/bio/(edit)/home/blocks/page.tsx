import type { Metadata } from 'next';

import { DashContent } from '~/app/[handle]/_components/dash-content';
import { DashContentHeader } from '~/app/[handle]/_components/dash-content-header';
import { BioBlocksPage } from '../../../_components/bio-blocks-page';

export const metadata: Metadata = {
	title: 'Bio - Blocks',
	description: 'Manage your bio page blocks',
};

export default function BlocksPage() {
	return (
		<>
			<DashContentHeader
				title='Bio Blocks'
				subtitle='Rearrange and toggle blocks for your bio page'
			/>
			<DashContent>
				<BioBlocksPage />
			</DashContent>
		</>
	);
}
