import { Card } from '@barely/ui/card';
import { Skeleton } from '@barely/ui/skeleton';

export function StatsCardsSkeleton() {
	return (
		<div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
			{[1, 2, 3, 4].map(i => (
				<Card key={i} className='p-4'>
					<Skeleton className='mb-2 h-4 w-24' />
					<Skeleton className='h-8 w-32' />
				</Card>
			))}
		</div>
	);
}
