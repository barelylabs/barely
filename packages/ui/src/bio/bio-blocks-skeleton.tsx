export function BioBlocksSkeleton() {
	return (
		<div className='flex flex-col gap-3'>
			{/* Skeleton for blocks */}
			<div className='h-12 animate-pulse rounded-xl bg-gray-200' />
			<div className='h-12 animate-pulse rounded-xl bg-gray-200' />
			<div className='h-12 animate-pulse rounded-xl bg-gray-200' />
		</div>
	);
}
