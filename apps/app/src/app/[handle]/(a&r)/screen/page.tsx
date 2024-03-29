import { Suspense } from 'react';

import { DashContentHeader } from '~/app/[handle]/_components/dash-content-header';
import { PlaylistPitchScreenForm } from './playlist-pitch-screen-form';

const ScreenPage = () => {
	return (
		<>
			<DashContentHeader title='Screening' />
			<Suspense fallback={null}>
				<PlaylistPitchScreenForm />
			</Suspense>
		</>
	);
};

export default ScreenPage;
