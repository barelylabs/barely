import { DashContent } from '~/app/[handle]/_components/dash-content';

export default function Loading() {
	return (
		<DashContent>
			<div className='flex flex-col gap-8 xl:flex-row'>
				{/* Left side: Form skeleton */}
				<div className='flex w-full max-w-64 flex-col gap-4'>
					{/* Flow Name field */}
					<div className='flex flex-col gap-1.5'>
						<div className='h-4 w-20 animate-pulse rounded bg-muted' />
						<div className='h-10 w-full animate-pulse rounded-md bg-muted' />
					</div>
					{/* Description field */}
					<div className='flex flex-col gap-1.5'>
						<div className='h-4 w-20 animate-pulse rounded bg-muted' />
						<div className='h-10 w-full animate-pulse rounded-md bg-muted' />
					</div>
					{/* Enabled switch */}
					<div className='flex items-center justify-between'>
						<div className='h-4 w-16 animate-pulse rounded bg-muted' />
						<div className='h-6 w-11 animate-pulse rounded-full bg-muted' />
					</div>
					{/* Save button */}
					<div className='h-10 w-full animate-pulse rounded-md bg-muted' />
					{/* Separator */}
					<div className='my-4 h-px w-full bg-border' />
					{/* Test flow button */}
					<div className='h-9 w-full animate-pulse rounded-md bg-muted' />
				</div>

				{/* Right side: Flow builder skeleton */}
				<div className='flex w-full items-center justify-center rounded-xl border border-border bg-border/25 p-10'>
					<div className='flex flex-col items-center gap-4'>
						{/* Trigger node skeleton */}
						<div className='h-16 w-48 animate-pulse rounded-lg bg-muted' />
						<div className='h-8 w-px bg-muted' />
						{/* Action node skeleton */}
						<div className='h-16 w-48 animate-pulse rounded-lg bg-muted' />
						<div className='h-8 w-px bg-muted' />
						{/* Another action node skeleton */}
						<div className='h-16 w-48 animate-pulse rounded-lg bg-muted' />
					</div>
				</div>
			</div>
		</DashContent>
	);
}
