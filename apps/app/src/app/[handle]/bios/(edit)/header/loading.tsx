import { DashContent } from '~/app/[handle]/_components/dash-content';
import { DashContentHeader } from '~/app/[handle]/_components/dash-content-header';

export default function Loading() {
	return (
		<>
			<DashContentHeader
				title='Header & Profile'
				subtitle='Customize your bio page header and profile display'
			/>
			<DashContent>
				<div className='flex flex-col gap-4'>
					<div className='h-10 w-full animate-pulse rounded-lg bg-muted' />
					<div className='h-10 w-full animate-pulse rounded-lg bg-muted' />
					<div className='h-32 w-full animate-pulse rounded-lg bg-muted' />
				</div>
			</DashContent>
		</>
	);
}
