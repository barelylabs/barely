import { Skeleton } from '@barely/ui/elements/skeleton';

export function DashContentHeaderSkeleton() {
	return (
		<div className='flex flex-row items-center justify-between'>
			<div className='flex flex-col space-y-2'>
				<Skeleton className='h-8 w-48' />
				<Skeleton className='h-4 w-64' />
			</div>
			<Skeleton className='h-10 w-24' />
		</div>
	);
}
