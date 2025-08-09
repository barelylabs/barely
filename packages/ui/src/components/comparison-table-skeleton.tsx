import { Card } from '@barely/ui/card';
import { Skeleton } from '@barely/ui/skeleton';

export function ComparisonTableSkeleton() {
	return (
		<Card className='overflow-hidden'>
			<div className='p-4'>
				<Skeleton className='h-6 w-40' />
			</div>
			<div className='border-t'>
				<div className='p-4'>
					{[1, 2, 3].map(i => (
						<div key={i} className='flex items-center gap-4 py-3'>
							<Skeleton className='h-4 w-32' />
							<Skeleton className='h-4 w-12 flex-1' />
							<Skeleton className='h-4 w-12' />
							<Skeleton className='h-4 w-12' />
							<Skeleton className='h-4 w-16' />
						</div>
					))}
				</div>
			</div>
		</Card>
	);
}
