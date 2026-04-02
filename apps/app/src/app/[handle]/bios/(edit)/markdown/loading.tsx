import { DashContent } from '~/app/[handle]/_components/dash-content';
import { DashContentHeader } from '~/app/[handle]/_components/dash-content-header';

export default function Loading() {
	return (
		<>
			<DashContentHeader title='Content' subtitle='Edit your bio page content' />
			<DashContent>
				<div className='h-64 w-full animate-pulse rounded-lg bg-muted' />
			</DashContent>
		</>
	);
}
