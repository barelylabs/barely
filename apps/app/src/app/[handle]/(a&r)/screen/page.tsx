import { Suspense } from 'react';

import { DashContent } from '~/app/[handle]/_components/dash-content';
import { DashContentHeader } from '~/app/[handle]/_components/dash-content-header';
import { PlaylistPitchScreenForm } from './playlist-pitch-screen-form';

const ScreenPage = () => {
	return (
		<>
			<DashContentHeader title='Screening' />
			<DashContent>
				<Suspense fallback={null}>
					<PlaylistPitchScreenForm />
				</Suspense>
			</DashContent>
		</>
	);
};

export default ScreenPage;
