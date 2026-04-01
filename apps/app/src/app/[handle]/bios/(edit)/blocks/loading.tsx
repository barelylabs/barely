import { DashContent } from '~/app/[handle]/_components/dash-content';
import { DashContentHeader } from '~/app/[handle]/_components/dash-content-header';

function BlockCardSkeleton() {
	return (
		<div className='rounded-lg border border-border bg-card p-4'>
			<div className='flex items-center justify-between'>
				<div className='flex items-center gap-3'>
					<div className='h-5 w-5 animate-pulse rounded bg-muted' />
					<div className='h-10 w-10 animate-pulse rounded-lg bg-muted' />
					<div className='flex flex-col gap-1'>
						<div className='h-5 w-28 animate-pulse rounded bg-muted' />
						<div className='h-4 w-16 animate-pulse rounded bg-muted' />
					</div>
				</div>
				<div className='flex items-center gap-2'>
					<div className='h-6 w-11 animate-pulse rounded-full bg-muted' />
					<div className='h-8 w-8 animate-pulse rounded bg-muted' />
				</div>
			</div>
		</div>
	);
}

export default function Loading() {
	return (
		<>
			<DashContentHeader
				title='Bio Blocks'
				subtitle='Rearrange and toggle blocks for your bio page'
			/>
			<DashContent>
				<div className='flex flex-col gap-2'>
					<BlockCardSkeleton />
					<BlockCardSkeleton />
					<BlockCardSkeleton />
					<BlockCardSkeleton />
				</div>
			</DashContent>
		</>
	);
}
