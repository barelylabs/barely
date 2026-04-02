import { DashContent } from '~/app/[handle]/_components/dash-content';
import { DashContentHeader } from '~/app/[handle]/_components/dash-content-header';

export default function Loading() {
	return (
		<>
			<DashContentHeader title='Links' subtitle='Manage your bio page links' />
			<DashContent>
				<div className='flex flex-col gap-4'>
					<div className='h-10 w-full animate-pulse rounded-lg bg-muted' />
					<div className='h-10 w-full animate-pulse rounded-lg bg-muted' />
					<div className='h-10 w-full animate-pulse rounded-lg bg-muted' />
				</div>
			</DashContent>
		</>
	);
}
