import { DashContent } from '~/app/[handle]/_components/dash-content';
import { DashContentHeader } from '~/app/[handle]/_components/dash-content-header';

export default function Loading() {
	return (
		<>
			<DashContentHeader title='Contact Form' subtitle='Customize your contact form' />
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
