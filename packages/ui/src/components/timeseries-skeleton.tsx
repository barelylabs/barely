import { Card } from '@barely/ui/card';
import { Skeleton } from '@barely/ui/skeleton';

export function TimeseriesSkeleton() {
	return (
		<Card className='p-6'>
			<div className='flex flex-col gap-4'>
				<div className='flex flex-row items-center justify-between'>
					<Skeleton className='h-16 w-48' />
					<div className='flex flex-row gap-6'>
						{[1, 2, 3, 4].map(i => (
							<Skeleton key={i} className='h-12 w-20' />
						))}
					</div>
				</div>
				<Skeleton className='h-72 w-full' />
			</div>
		</Card>
	);
}
