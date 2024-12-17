export function GridListSkeleton({ count = 4 }: { count?: number }) {
	return (
		<div className='flex flex-col gap-2'>
			{Array.from({ length: count }).map((_, index) => (
				<div key={index} className='h-20 w-full animate-pulse rounded-lg bg-muted' />
			))}
		</div>
	);
}
