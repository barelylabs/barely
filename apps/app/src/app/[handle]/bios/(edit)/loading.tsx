import { DashContent } from '~/app/[handle]/_components/dash-content';

export default function Loading() {
	return (
		<>
			{/* Header skeleton matching DashContentHeader */}
			<div className='flex flex-row items-center justify-between border-b border-subtle-foreground/70 bg-accent p-3 md:border-0 md:bg-transparent md:p-6 md:pb-0 lg:pt-8'>
				<div className='flex flex-col space-y-2'>
					<div className='h-7 w-40 animate-pulse rounded bg-muted' />
					<div className='h-4 w-56 animate-pulse rounded bg-muted' />
				</div>
			</div>
			{/* Content skeleton */}
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
