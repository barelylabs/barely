import { DashContent } from '~/app/[handle]/_components/dash-content';
import { DashContentHeader } from '~/app/[handle]/_components/dash-content-header';

export default function Loading() {
	return (
		<>
			<DashContentHeader title='Image' subtitle='Manage your bio page image' />
			<DashContent>
				<div className='flex flex-col gap-4'>
					<div className='aspect-video w-full animate-pulse rounded-lg bg-muted' />
					<div className='h-10 w-full animate-pulse rounded-lg bg-muted' />
				</div>
			</DashContent>
		</>
	);
}
