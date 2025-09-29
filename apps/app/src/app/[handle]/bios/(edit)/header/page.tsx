'use client';

import { useWorkspace } from '@barely/hooks';

import { DashContent } from '~/app/[handle]/_components/dash-content';
import { DashContentHeader } from '~/app/[handle]/_components/dash-content-header';
import { BioHeaderPage } from '../../_components/bio-header-page';

export default function HeaderPage() {
	const { handle } = useWorkspace();

	return (
		<>
			<DashContentHeader
				title='Header & Profile'
				subtitle='Customize your bio page header and profile display'
			/>
			<DashContent>
				<BioHeaderPage handle={handle} />
			</DashContent>
		</>
	);
}
